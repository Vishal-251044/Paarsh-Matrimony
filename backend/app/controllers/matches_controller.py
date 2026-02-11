from typing import List, Dict, Any, Optional, Tuple
import re
from datetime import datetime
import numpy as np

from app.database import db

class MatchesController:
    def __init__(self):
        self.profiles_collection = db.profiles
        self.users_collection = db.users
    
    async def get_profile_by_email(self, email: str) -> Optional[Dict]:
        """Get profile by email"""
        try:
            profile = await self.profiles_collection.find_one({"email": email})
            if profile and "_id" in profile:
                profile["_id"] = str(profile["_id"])
            return profile
        except Exception as e:
            print(f"Error getting profile: {str(e)}")
            return None
    
    async def get_user_status(self, email: str) -> Dict:
        try:
            user = await self.users_collection.find_one({"email": email})
            if not user:
                return {"isOnline": False, "lastSeen": None}
    
            return {
                "isOnline": user.get("is_online", False),
                "lastSeen": user.get("last_seen")
            }
        except:
            return {"isOnline": False, "lastSeen": None}

    async def get_all_published_profiles(self) -> List[Dict]:
        """Get all published profiles"""
        try:
            cursor = self.profiles_collection.find({"isPublished": True})
            profiles = []
            async for profile in cursor:
                if "_id" in profile:
                    profile["_id"] = str(profile["_id"])
                profiles.append(profile)
            return profiles
        except Exception as e:
            print(f"Error getting published profiles: {str(e)}")
            return []
    
    def calculate_match_score(self, user_profile: Dict, other_profile: Dict) -> float:
        """
        Calculate match score between two profiles (0-100)
        Strict rules: Same religion, caste, state
        Perfect 100% only when ALL key attributes match
        """
        
        if not user_profile or not other_profile:
            return 0.0
        
        if not user_profile.get('isPublished') or not other_profile.get('isPublished'):
            return 0.0
        
        # ========== STRICT RULES CHECK - IMMEDIATE REJECTION ==========
        # 1. Gender must be opposite (for heterosexual matching)
        user_gender = self._clean_text(user_profile.get('personalInfo', {}).get('gender', ''))
        other_gender = self._clean_text(other_profile.get('personalInfo', {}).get('gender', ''))
        
        if user_gender == other_gender:
            return 0.0
        
        # 2. Strict: Must have same religion
        user_religion = self._clean_text(user_profile.get('religionInfo', {}).get('religion', ''))
        other_religion = self._clean_text(other_profile.get('religionInfo', {}).get('religion', ''))
        
        if not user_religion or not other_religion or user_religion != other_religion:
            return 0.0
        
        # 3. Strict: Must have same caste (if user specified caste)
        user_caste = self._clean_text(user_profile.get('religionInfo', {}).get('caste', ''))
        other_caste = self._clean_text(other_profile.get('religionInfo', {}).get('caste', ''))
        
        if user_caste and user_caste not in ['', 'any', 'no preference', 'none', 'doesnt matter', 'no']:
            if not other_caste or other_caste in ['', 'any', 'no preference', 'none'] or user_caste != other_caste:
                return 0.0
        
        # 4. Strict: Must have same state
        user_state = self._clean_text(user_profile.get('locationInfo', {}).get('state', ''))
        other_state = self._clean_text(other_profile.get('locationInfo', {}).get('state', ''))
        
        if not user_state or not other_state or user_state != other_state:
            return 0.0
        
        # ========== ATTRIBUTE MATCHING SCORING ==========
        # Each attribute contributes to the score
        attribute_scores = []
        attribute_weights = []
        
        # 1. PREFERRED LOCATION vs CURRENT LOCATION MATCHING (15% weight)
        user_pref_location = self._clean_text(user_profile.get('partnerInfo', {}).get('preferredLocation', ''))
        other_current_location = self._clean_text(other_profile.get('locationInfo', {}).get('currentLocation', ''))
        
        location_score = self._calculate_location_preference_score(user_pref_location, other_current_location)
        attribute_scores.append(location_score)
        attribute_weights.append(0.15)
        
        # 2. AGE COMPATIBILITY (12% weight)
        user_age = self._parse_age(user_profile.get('personalInfo', {}).get('age', '0'))
        other_age = self._parse_age(other_profile.get('personalInfo', {}).get('age', '0'))
        user_pref_age_range = self._clean_text(user_profile.get('partnerInfo', {}).get('preferredAgeRange', ''))
        
        age_score = self._calculate_age_score(user_gender, user_age, other_age, user_pref_age_range)
        attribute_scores.append(age_score)
        attribute_weights.append(0.12)
        
        # 3. HEIGHT COMPATIBILITY (12% weight)
        user_height = self._clean_text(user_profile.get('personalInfo', {}).get('height', ''))
        other_height = self._clean_text(other_profile.get('personalInfo', {}).get('height', ''))
        user_pref_height = self._clean_text(user_profile.get('partnerInfo', {}).get('preferredHeight', ''))
        
        height_score = self._calculate_height_score(user_gender, user_height, other_height, user_pref_height)
        attribute_scores.append(height_score)
        attribute_weights.append(0.12)
        
        # 4. EDUCATION MATCHING (10% weight)
        user_education = self._clean_text(user_profile.get('educationInfo', {}).get('highestEducation', ''))
        other_education = self._clean_text(other_profile.get('educationInfo', {}).get('highestEducation', ''))
        user_pref_education = self._clean_text(user_profile.get('partnerInfo', {}).get('preferredEducation', ''))
        
        education_score = self._calculate_education_score(user_education, other_education, user_pref_education)
        attribute_scores.append(education_score)
        attribute_weights.append(0.10)
        
        # 5. PROFESSION MATCHING (10% weight)
        user_profession = self._clean_text(user_profile.get('careerInfo', {}).get('profession', ''))
        other_profession = self._clean_text(other_profile.get('careerInfo', {}).get('profession', ''))
        user_pref_profession = self._clean_text(user_profile.get('partnerInfo', {}).get('preferredProfession', ''))
        
        profession_score = self._calculate_profession_score(user_profession, other_profession, user_pref_profession)
        attribute_scores.append(profession_score)
        attribute_weights.append(0.10)
        
        # 6. ANNUAL INCOME MATCHING (8% weight)
        user_income = self._clean_text(user_profile.get('careerInfo', {}).get('annualIncome', ''))
        other_income = self._clean_text(other_profile.get('careerInfo', {}).get('annualIncome', ''))
        user_pref_income = self._clean_text(user_profile.get('partnerInfo', {}).get('preferredIncome', ''))
        
        income_score = self._calculate_income_score(user_income, other_income, user_pref_income)
        attribute_scores.append(income_score)
        attribute_weights.append(0.08)
        
        # 7. MARITAL STATUS MATCHING (8% weight)
        user_marital = self._clean_text(user_profile.get('personalInfo', {}).get('maritalStatus', ''))
        other_marital = self._clean_text(other_profile.get('personalInfo', {}).get('maritalStatus', ''))
        user_pref_marital = self._clean_text(user_profile.get('partnerInfo', {}).get('preferredMaritalStatus', 'Never Married'))
        
        marital_score = self._calculate_marital_score(user_marital, other_marital, user_pref_marital)
        attribute_scores.append(marital_score)
        attribute_weights.append(0.08)
        
        # 8. WEIGHT COMPATIBILITY (5% weight)
        user_weight = self._parse_weight(user_profile.get('personalInfo', {}).get('weight', ''))
        other_weight = self._parse_weight(other_profile.get('personalInfo', {}).get('weight', ''))
        
        weight_score = self._calculate_weight_score(user_weight, other_weight)
        attribute_scores.append(weight_score)
        attribute_weights.append(0.05)
        
        # 9. EMPLOYMENT TYPE MATCHING (5% weight)
        user_emp_type = self._clean_text(user_profile.get('careerInfo', {}).get('employmentType', ''))
        other_emp_type = self._clean_text(other_profile.get('careerInfo', {}).get('employmentType', ''))
        
        employment_score = self._calculate_employment_score(user_emp_type, other_emp_type)
        attribute_scores.append(employment_score)
        attribute_weights.append(0.05)
        
        # 10. MOTHER TONGUE MATCHING (5% weight)
        user_tongue = self._clean_text(user_profile.get('religionInfo', {}).get('motherTongue', ''))
        other_tongue = self._clean_text(other_profile.get('religionInfo', {}).get('motherTongue', ''))
        user_pref_tongue = self._clean_text(user_profile.get('partnerInfo', {}).get('preferredMotherTongue', ''))
        
        tongue_score = self._calculate_tongue_score(user_tongue, other_tongue, user_pref_tongue)
        attribute_scores.append(tongue_score)
        attribute_weights.append(0.05)
        
        # 11. NATIVE PLACE MATCHING (4% weight)
        user_native = self._clean_text(user_profile.get('familyInfo', {}).get('nativePlace', ''))
        other_native = self._clean_text(other_profile.get('familyInfo', {}).get('nativePlace', ''))
        
        native_score = self._calculate_native_score(user_native, other_native)
        attribute_scores.append(native_score)
        attribute_weights.append(0.04)
        
        # 12. BLOOD GROUP COMPATIBILITY (3% weight)
        user_blood = self._clean_text(user_profile.get('personalInfo', {}).get('bloodGroup', ''), upper=True)
        other_blood = self._clean_text(other_profile.get('personalInfo', {}).get('bloodGroup', ''), upper=True)
        
        blood_score = self._calculate_blood_score(user_blood, other_blood)
        attribute_scores.append(blood_score)
        attribute_weights.append(0.03)
        
        # 13. DISABILITY MATCHING (3% weight)
        user_disability = self._clean_text(user_profile.get('personalInfo', {}).get('disability', 'No'))
        other_disability = self._clean_text(other_profile.get('personalInfo', {}).get('disability', 'No'))
        
        disability_score = self._calculate_disability_score(user_disability, other_disability)
        attribute_scores.append(disability_score)
        attribute_weights.append(0.03)
        
        # Calculate weighted average
        if not attribute_scores:
            return 0.0
        
        weighted_sum = sum(score * weight for score, weight in zip(attribute_scores, attribute_weights))
        total_weight = sum(attribute_weights)
        
        if total_weight == 0:
            return 0.0
        
        base_score = (weighted_sum / total_weight) * 100
        
        # Apply bonuses
        final_score = self._apply_bonuses(user_profile, other_profile, base_score)
        
        # Ensure score doesn't exceed 100
        final_score = min(100.0, max(0.0, round(final_score, 2)))
        
        return final_score
    
    def _clean_text(self, text: str, upper: bool = False) -> str:
        """Clean and normalize text"""
        if not text:
            return ''
        cleaned = str(text).strip().lower()
        if upper:
            cleaned = cleaned.upper()
        return cleaned
    
    def _parse_age(self, age_str: str) -> int:
        """Parse age string to integer"""
        try:
            if isinstance(age_str, (int, float)):
                return int(age_str)
            if age_str:
                # Extract digits
                digits = re.findall(r'\d+', str(age_str))
                if digits:
                    return int(digits[0])
            return 0
        except:
            return 0
    
    def _parse_weight(self, weight_str: str) -> float:
        """Parse weight string to kg"""
        try:
            if not weight_str:
                return 0.0
            # Extract numbers
            weight_str = str(weight_str).lower()
            # Remove kg, kgs, etc and keep numbers/dots
            weight_str = re.sub(r'[^\d.]', '', weight_str)
            if weight_str:
                return float(weight_str)
            return 0.0
        except:
            return 0.0
    
    def _calculate_location_preference_score(self, user_pref_location: str, other_current_location: str) -> float:
        """
        Calculate location preference score (0-1)
        Compares user's preferredLocation with other's currentLocation
        """
        if not other_current_location:
            return 0.5
        
        # If user has no location preference, give base score
        if not user_pref_location or user_pref_location in ['', 'any', 'no preference', 'doesnt matter', 'no']:
            return 0.7  # Base score when no preference
        
        user_pref = user_pref_location.lower()
        other_current = other_current_location.lower()
        
        # Exact match
        if user_pref == other_current:
            return 1.0
        
        # Check if other's location contains user's preferred location
        if user_pref in other_current:
            return 0.9
        
        # Check if user's preferred location contains other's location
        if other_current in user_pref:
            return 0.8
        
        # Split into words and check for common words
        user_words = set(re.split(r'[,.\s-]+', user_pref))
        other_words = set(re.split(r'[,.\s-]+', other_current))
        
        common_words = user_words & other_words
        if len(common_words) >= 2:
            return 0.8  # Multiple common words (e.g., "New Delhi" and "Delhi")
        elif len(common_words) == 1:
            # Check if the common word is significant (not generic)
            generic_words = {'city', 'town', 'village', 'area', 'locality', 'place'}
            common_word = list(common_words)[0]
            if common_word not in generic_words:
                return 0.7
        
        # Check for similar sounding names (first 3-4 characters)
        if len(user_pref) >= 3 and len(other_current) >= 3:
            if user_pref[:3] == other_current[:3]:
                return 0.6
        
        # Different locations
        return 0.3
    
    def _calculate_age_score(self, user_gender: str, user_age: int, other_age: int, user_pref_age_range: str) -> float:
        """
        Calculate age compatibility score (0-1)
        Considers user's age preference range
        """
        if user_age <= 0 or other_age <= 0:
            return 0.5
        
        # First check if age matches user's preference
        if user_pref_age_range and user_pref_age_range not in ['', 'any', 'no preference', 'doesnt matter']:
            # Parse age range like "25-30" or "25+" or "25 to 30"
            age_in_range = self._check_age_in_range(other_age, user_pref_age_range)
            if age_in_range:
                return 1.0  # Perfect match with preference
            else:
                # Age doesn't match preference
                return 0.3
        
        # No age preference specified, use traditional norms
        age_diff = other_age - user_age
        
        if user_gender == 'male':
            # Male user: Preferred if female is younger or same age
            if age_diff <= 0:  # Female is younger or same age
                diff = abs(age_diff)
                if diff == 0:
                    return 0.9  # Same age
                elif diff <= 3:
                    return 0.8  # 0-3 years younger
                elif diff <= 7:
                    return 0.7  # 4-7 years younger
                elif diff <= 10:
                    return 0.6  # 8-10 years younger
                else:
                    return 0.4  # More than 10 years younger
            else:  # Female is older
                diff = age_diff
                if diff <= 3:
                    return 0.6  # 0-3 years older
                elif diff <= 5:
                    return 0.4  # 4-5 years older
                else:
                    return 0.2  # More than 5 years older
        else:  # Female user
            # Female user: Preferred if male is older
            if age_diff > 0:  # Male is older
                diff = age_diff
                if diff <= 3:
                    return 0.9  # 0-3 years older
                elif diff <= 7:
                    return 0.8  # 4-7 years older
                elif diff <= 10:
                    return 0.7  # 8-10 years older
                else:
                    return 0.5  # More than 10 years older
            elif age_diff == 0:  # Same age
                return 0.7
            else:  # Male is younger
                diff = abs(age_diff)
                if diff <= 3:
                    return 0.5  # 0-3 years younger
                elif diff <= 5:
                    return 0.3  # 4-5 years younger
                else:
                    return 0.1  # More than 5 years younger
    
    def _check_age_in_range(self, age: int, age_range: str) -> bool:
        """Check if age is within the specified range"""
        try:
            age_range = str(age_range).lower()
            
            # Handle "25-30" format
            if '-' in age_range:
                parts = age_range.split('-')
                if len(parts) == 2:
                    min_age = int(re.sub(r'[^\d]', '', parts[0]))
                    max_age = int(re.sub(r'[^\d]', '', parts[1]))
                    return min_age <= age <= max_age
            
            # Handle "25+" format
            elif '+' in age_range:
                min_age = int(re.sub(r'[^\d]', '', age_range))
                return age >= min_age
            
            # Handle "25 to 30" format
            elif 'to' in age_range:
                parts = age_range.split('to')
                if len(parts) == 2:
                    min_age = int(re.sub(r'[^\d]', '', parts[0]))
                    max_age = int(re.sub(r'[^\d]', '', parts[1]))
                    return min_age <= age <= max_age
            
            # Single age
            else:
                target_age = int(re.sub(r'[^\d]', '', age_range))
                return age == target_age
                
        except:
            return False
    
    def _calculate_height_score(self, user_gender: str, user_height: str, other_height: str, user_pref_height: str) -> float:
        """
        Calculate height compatibility score (0-1)
        Considers user's height preference
        """
        other_cm = self._parse_height_to_cm(other_height)
        if other_cm <= 0:
            return 0.5
        
        # First check if height matches user's preference
        if user_pref_height and user_pref_height not in ['', 'any', 'no preference', 'doesnt matter']:
            pref_cm = self._parse_height_to_cm(user_pref_height)
            if pref_cm > 0:
                # Check if other's height meets or exceeds preference
                if other_cm >= pref_cm:
                    return 1.0  # Meets or exceeds preference
                else:
                    # Calculate how close it is to preference
                    ratio = other_cm / pref_cm
                    if ratio >= 0.95:
                        return 0.8
                    elif ratio >= 0.90:
                        return 0.6
                    elif ratio >= 0.85:
                        return 0.4
                    else:
                        return 0.2
        
        # No height preference, use traditional norms
        user_cm = self._parse_height_to_cm(user_height)
        if user_cm <= 0:
            return 0.5
        
        height_diff = other_cm - user_cm
        
        if user_gender == 'male':
            # Male user: Preferred if female is shorter
            if height_diff < 0:  # Female is shorter
                diff = abs(height_diff)
                if diff <= 10:
                    return 0.9  # 0-10cm shorter
                elif diff <= 20:
                    return 0.8  # 11-20cm shorter
                elif diff <= 30:
                    return 0.7  # 21-30cm shorter
                else:
                    return 0.5  # More than 30cm shorter
            elif height_diff == 0:
                return 0.7  # Same height
            else:  # Female is taller
                diff = height_diff
                if diff <= 5:
                    return 0.6  # 0-5cm taller
                elif diff <= 10:
                    return 0.4  # 6-10cm taller
                else:
                    return 0.2  # More than 10cm taller
        else:  # Female user
            # Female user: Preferred if male is taller
            if height_diff > 0:  # Male is taller
                diff = height_diff
                if diff <= 10:
                    return 0.9  # 0-10cm taller
                elif diff <= 20:
                    return 0.8  # 11-20cm taller
                elif diff <= 30:
                    return 0.7  # 21-30cm taller
                else:
                    return 0.5  # More than 30cm taller
            elif height_diff == 0:
                return 0.7  # Same height
            else:  # Male is shorter
                diff = abs(height_diff)
                if diff <= 5:
                    return 0.6  # 0-5cm shorter
                elif diff <= 10:
                    return 0.4  # 6-10cm shorter
                else:
                    return 0.2  # More than 10cm shorter
    
    def _parse_height_to_cm(self, height_str: str) -> float:
        """Parse height string to cm"""
        try:
            if not height_str:
                return 0.0
            
            height_str = str(height_str).lower().strip()
            
            # Handle feet-inch format
            if "'" in height_str or '"' in height_str or 'ft' in height_str or 'in' in height_str:
                feet = 0.0
                inches = 0.0
                
                # Remove spaces
                height_str = height_str.replace(' ', '')
                
                # Handle 5'8" or 5'8
                if "'" in height_str:
                    parts = height_str.split("'")
                    if parts[0]:
                        feet = float(parts[0])
                    if len(parts) > 1 and parts[1]:
                        inch_part = parts[1].replace('"', '')
                        if inch_part:
                            inches = float(inch_part)
                
                # Handle 5ft8in
                elif 'ft' in height_str:
                    ft_idx = height_str.find('ft')
                    if ft_idx > 0:
                        feet = float(height_str[:ft_idx])
                    if 'in' in height_str:
                        in_idx = height_str.find('in')
                        if in_idx > ft_idx + 2:
                            inch_part = height_str[ft_idx+2:in_idx]
                            if inch_part:
                                inches = float(inch_part)
                
                return feet * 30.48 + inches * 2.54
            
            # Handle cm format
            elif 'cm' in height_str:
                num_str = height_str.replace('cm', '').strip()
                return float(num_str) if num_str else 0.0
            
            # Try to parse as number
            try:
                num = float(height_str)
                # If number < 10, assume feet
                if num < 10:
                    return num * 30.48
                # If between 100-250, assume cm
                elif 100 <= num <= 250:
                    return num
                else:
                    return 0.0
            except:
                return 0.0
                
        except:
            return 0.0
    
    def _calculate_education_score(self, user_education: str, other_education: str, user_pref_education: str) -> float:
        """Calculate education compatibility score (0-1)"""
        if not other_education:
            return 0.5
        
        # First check if matches user's preference
        if user_pref_education and user_pref_education not in ['', 'any', 'no preference', 'doesnt matter']:
            if self._check_education_match(other_education, user_pref_education):
                return 1.0  # Matches preference
            else:
                return 0.3  # Doesn't match preference
        
        # No preference, check compatibility
        if not user_education:
            return 0.5
        
        user_edu = user_education.lower()
        other_edu = other_education.lower()
        
        # Exact match
        if user_edu == other_edu:
            return 0.9
        
        # Education hierarchy
        edu_levels = {
            'phd': 7,
            'doctorate': 7,
            'post doctorate': 7,
            'masters': 6,
            'post graduation': 6,
            'm.tech': 6,
            'mba': 6,
            'mca': 6,
            'ms': 6,
            'bachelors': 5,
            'graduation': 5,
            'b.tech': 5,
            'b.e': 5,
            'b.sc': 5,
            'b.com': 5,
            'b.a': 5,
            'engineering': 5,
            'diploma': 4,
            'polytechnic': 4,
            '12th': 3,
            'intermediate': 3,
            'hsc': 3,
            'higher secondary': 3,
            '10th': 2,
            'secondary': 2,
            'ssc': 2,
            'school': 1
        }
        
        # Find education levels
        user_level = 0
        other_level = 0
        
        for term, level in edu_levels.items():
            if term in user_edu:
                user_level = max(user_level, level)
            if term in other_edu:
                other_level = max(other_level, level)
        
        if user_level == 0 or other_level == 0:
            return 0.5
        
        # Similar levels are preferred
        level_diff = abs(user_level - other_level)
        
        if level_diff == 0:
            return 0.8  # Same level
        elif level_diff == 1:
            return 0.6  # One level difference
        elif level_diff == 2:
            return 0.4  # Two levels difference
        else:
            return 0.2  # More than two levels difference
    
    def _check_education_match(self, actual_edu: str, pref_edu: str) -> bool:
        """Check if actual education matches preference"""
        actual = actual_edu.lower()
        pref = pref_edu.lower()
        
        # Exact match
        if actual == pref:
            return True
        
        # Check if actual contains preference
        if pref in actual:
            return True
        
        # Check education hierarchy
        edu_hierarchy = [
            ['phd', 'doctorate'],
            ['masters', 'post graduation', 'm.tech', 'mba'],
            ['bachelors', 'graduation', 'b.tech', 'engineering'],
            ['diploma'],
            ['12th', 'intermediate'],
            ['10th', 'secondary']
        ]
        
        # Find which level the preference refers to
        pref_level = -1
        actual_level = -1
        
        for level_idx, terms in enumerate(edu_hierarchy):
            if any(term in pref for term in terms):
                pref_level = level_idx
            if any(term in actual for term in terms):
                actual_level = level_idx
        
        # If actual meets or exceeds preference level
        if pref_level >= 0 and actual_level >= 0 and actual_level <= pref_level:
            return True
        
        return False
    
    def _calculate_profession_score(self, user_profession: str, other_profession: str, user_pref_profession: str) -> float:
        """Calculate profession compatibility score (0-1)"""
        if not other_profession:
            return 0.5
        
        # First check if matches user's preference
        if user_pref_profession and user_pref_profession not in ['', 'any', 'no preference', 'doesnt matter']:
            if self._check_profession_match(other_profession, user_pref_profession):
                return 1.0  # Matches preference
            else:
                return 0.3  # Doesn't match preference
        
        # No preference, check compatibility
        if not user_profession:
            return 0.5
        
        user_prof = user_profession.lower()
        other_prof = other_profession.lower()
        
        # Exact match
        if user_prof == other_prof:
            return 0.9
        
        # Profession categories
        prof_categories = {
            'engineering': ['engineer', 'software', 'developer', 'programmer', 'it', 'technology'],
            'medical': ['doctor', 'nurse', 'surgeon', 'physician', 'dentist', 'medical'],
            'education': ['teacher', 'professor', 'lecturer', 'faculty', 'education'],
            'business': ['business', 'entrepreneur', 'self employed', 'trader', 'businessman'],
            'government': ['government', 'public sector', 'officer', 'administrative'],
            'corporate': ['private', 'corporate', 'company', 'employee', 'manager'],
            'legal': ['lawyer', 'advocate', 'judge', 'legal'],
            'finance': ['bank', 'finance', 'accountant', 'ca', 'financial'],
            'student': ['student', 'studying']
        }
        
        # Find categories
        user_cats = set()
        other_cats = set()
        
        for category, terms in prof_categories.items():
            if any(term in user_prof for term in terms):
                user_cats.add(category)
            if any(term in other_prof for term in terms):
                other_cats.add(category)
        
        # Check for common categories
        common_cats = user_cats & other_cats
        if common_cats:
            return 0.8  # Same category
        
        # Check for similar categories
        similar_categories = [
            {'engineering', 'corporate'},
            {'medical', 'healthcare'},
            {'education', 'government'},
            {'business', 'finance'}
        ]
        
        for similar_set in similar_categories:
            if (user_cats & similar_set) and (other_cats & similar_set):
                return 0.6  # Similar categories
        
        return 0.4  # Different categories
    
    def _check_profession_match(self, actual_prof: str, pref_prof: str) -> bool:
        """Check if actual profession matches preference"""
        actual = actual_prof.lower()
        pref = pref_prof.lower()
        
        # Exact match
        if actual == pref:
            return True
        
        # Check if actual contains preference
        if pref in actual:
            return True
        
        # Check profession categories
        prof_categories = {
            'engineer': ['engineer', 'software', 'developer', 'programmer'],
            'doctor': ['doctor', 'surgeon', 'physician'],
            'teacher': ['teacher', 'professor', 'lecturer'],
            'business': ['business', 'entrepreneur', 'trader'],
            'government': ['government', 'officer', 'administrative']
        }
        
        # Check if both are in same category
        for category, terms in prof_categories.items():
            actual_in_category = any(term in actual for term in terms)
            pref_in_category = any(term in pref for term in terms)
            if actual_in_category and pref_in_category:
                return True
        
        return False
    
    def _calculate_income_score(self, user_income: str, other_income: str, user_pref_income: str) -> float:
        """Calculate income compatibility score (0-1)"""
        other_num = self._parse_income(other_income)
        if other_num <= 0:
            return 0.5
        
        # First check if matches user's preference
        if user_pref_income and user_pref_income not in ['', 'any', 'no preference', 'doesnt matter']:
            pref_num = self._parse_income(user_pref_income)
            if pref_num > 0:
                # Check if other's income meets or exceeds preference
                if other_num >= pref_num:
                    return 1.0  # Meets or exceeds preference
                else:
                    # Calculate how close it is
                    ratio = other_num / pref_num
                    if ratio >= 0.8:
                        return 0.7
                    elif ratio >= 0.6:
                        return 0.5
                    elif ratio >= 0.4:
                        return 0.3
                    else:
                        return 0.1
        
        # No preference, compare with user's income
        user_num = self._parse_income(user_income)
        if user_num <= 0:
            return 0.5
        
        # Calculate ratio (smaller/larger)
        smaller = min(user_num, other_num)
        larger = max(user_num, other_num)
        
        if larger == 0:
            return 0.5
        
        ratio = smaller / larger
        
        if ratio >= 0.9:
            return 0.9  # Almost same
        elif ratio >= 0.7:
            return 0.7  # Similar
        elif ratio >= 0.5:
            return 0.5  # Moderate difference
        elif ratio >= 0.3:
            return 0.3  # Significant difference
        else:
            return 0.1  # Very different
    
    def _parse_income(self, income_str: str) -> float:
        """Parse income string to annual rupees"""
        try:
            if not income_str:
                return 0.0
            
            income_str = str(income_str).lower().strip()
            
            # Handle LPA format
            if 'lpa' in income_str or 'lakh' in income_str:
                match = re.search(r'(\d+(?:\.\d+)?)', income_str)
                if match:
                    lakhs = float(match.group(1))
                    return lakhs * 100000
            
            # Handle range: 5-10 LPA
            elif '-' in income_str:
                parts = income_str.split('-')
                min_val = self._parse_income(parts[0])
                max_val = self._parse_income(parts[1])
                if min_val > 0 and max_val > 0:
                    return (min_val + max_val) / 2
            
            # Handle plus: 10+ LPA
            elif '+' in income_str:
                match = re.search(r'(\d+(?:\.\d+)?)\+', income_str)
                if match:
                    lakhs = float(match.group(1))
                    return lakhs * 100000
            
            # Extract any number
            match = re.search(r'(\d+(?:\.\d+)?)', income_str)
            if match:
                num = float(match.group(1))
                # If number is small, assume lakhs
                if num < 100:
                    return num * 100000
                else:
                    return num
            
            return 0.0
                
        except:
            return 0.0
    
    def _calculate_marital_score(self, user_marital: str, other_marital: str, user_pref_marital: str) -> float:
        """Calculate marital status compatibility score (0-1)"""
        if not other_marital:
            return 0.5
        
        # Check if matches user's preference
        if user_pref_marital and user_pref_marital not in ['', 'any', 'no preference', 'doesnt matter']:
            if other_marital == user_pref_marital:
                return 1.0  # Exact match with preference
            else:
                return 0.2  # Doesn't match preference
        
        # No preference, check compatibility
        if not user_marital:
            return 0.5
        
        # Same status is usually preferred
        if user_marital == other_marital:
            return 0.9
        
        # Some status combinations are more compatible
        compatible_combinations = {
            'never married': ['never married', 'divorced', 'widowed'],
            'divorced': ['divorced', 'widowed', 'never married'],
            'widowed': ['widowed', 'divorced', 'never married']
        }
        
        if user_marital in compatible_combinations:
            if other_marital in compatible_combinations[user_marital]:
                return 0.7  # Compatible status
        
        return 0.4  # Less compatible
    
    def _calculate_weight_score(self, user_weight: float, other_weight: float) -> float:
        """Calculate weight compatibility score (0-1)"""
        if user_weight <= 0 or other_weight <= 0:
            return 0.5
        
        # Calculate percentage difference
        avg_weight = (user_weight + other_weight) / 2
        diff = abs(user_weight - other_weight)
        diff_percent = (diff / avg_weight) * 100 if avg_weight > 0 else 100
        
        if diff_percent <= 10:
            return 0.9  # Within 10%
        elif diff_percent <= 20:
            return 0.7  # Within 20%
        elif diff_percent <= 30:
            return 0.5  # Within 30%
        elif diff_percent <= 40:
            return 0.3  # Within 40%
        else:
            return 0.1  # More than 40% difference
    
    def _calculate_employment_score(self, user_emp_type: str, other_emp_type: str) -> float:
        """Calculate employment type compatibility score (0-1)"""
        if not user_emp_type or not other_emp_type:
            return 0.5
        
        # Same type
        if user_emp_type == other_emp_type:
            return 0.9
        
        # Group similar types
        emp_groups = {
            'stable': ['government', 'public sector', 'psu'],
            'corporate': ['private', 'corporate', 'mnc'],
            'business': ['business', 'self-employed', 'entrepreneur'],
            'professional': ['professional', 'consultant']
        }
        
        # Find groups
        user_group = None
        other_group = None
        
        for group, types in emp_groups.items():
            if user_emp_type in types:
                user_group = group
            if other_emp_type in types:
                other_group = group
        
        # Same group
        if user_group and other_group and user_group == other_group:
            return 0.7
        
        # Some cross-group compatibility
        compatible_groups = [
            {'government', 'public sector'},
            {'private', 'corporate'},
            {'business', 'self-employed'}
        ]
        
        for group_set in compatible_groups:
            if user_emp_type in group_set and other_emp_type in group_set:
                return 0.6
        
        return 0.4  # Different types
    
    def _calculate_tongue_score(self, user_tongue: str, other_tongue: str, user_pref_tongue: str) -> float:
        """Calculate mother tongue compatibility score (0-1)"""
        if not other_tongue:
            return 0.5
        
        # Check preference
        if user_pref_tongue and user_pref_tongue not in ['', 'any', 'no preference', 'doesnt matter']:
            if other_tongue == user_pref_tongue:
                return 1.0  # Matches preference
            else:
                return 0.3  # Doesn't match
        
        # No preference, check if same
        if user_tongue == other_tongue:
            return 0.9
        
        # Check language families
        lang_families = {
            'hindi': ['hindi', 'urdu', 'haryanvi'],
            'marathi': ['marathi', 'konkani'],
            'bengali': ['bengali', 'assamese'],
            'tamil': ['tamil', 'malayalam'],
            'telugu': ['telugu', 'kannada']
        }
        
        user_family = None
        other_family = None
        
        for family, langs in lang_families.items():
            if user_tongue in langs:
                user_family = family
            if other_tongue in langs:
                other_family = family
        
        if user_family and other_family and user_family == other_family:
            return 0.7  # Same language family
        
        return 0.5  # Different languages
    
    def _calculate_native_score(self, user_native: str, other_native: str) -> float:
        """Calculate native place compatibility score (0-1)"""
        if not user_native or not other_native:
            return 0.5
        
        if user_native == other_native:
            return 0.9
        
        # Check for same district/city
        user_parts = re.split(r'[,.\s-]+', user_native)
        other_parts = re.split(r'[,.\s-]+', other_native)
        
        if user_parts and other_parts and user_parts[0] == other_parts[0]:
            return 0.7  # Same district
        
        # Check for common parts
        common_parts = set(user_parts) & set(other_parts)
        if common_parts:
            return 0.6  # Some commonality
        
        return 0.4  # Different
    
    def _calculate_blood_score(self, user_blood: str, other_blood: str) -> float:
        """Calculate blood group compatibility score (0-1)"""
        if not user_blood or not other_blood:
            return 0.6
        
        user_blood = user_blood.upper()
        other_blood = other_blood.upper()
        
        # Same blood group
        if user_blood == other_blood:
            return 0.9
        
        # Extract ABO type and Rh factor
        user_type = user_blood[:2] if len(user_blood) > 1 else user_blood[0]
        other_type = other_blood[:2] if len(other_blood) > 1 else other_blood[0]
        user_rh = '+' if '+' in user_blood else '-' if '-' in user_blood else ''
        other_rh = '+' if '+' in other_blood else '-' if '-' in other_blood else ''
        
        # Compatible blood types (simplified)
        compatible_types = {
            'O': ['O', 'A', 'B', 'AB'],
            'A': ['A', 'AB'],
            'B': ['B', 'AB'],
            'AB': ['AB']
        }
        
        # Check compatibility
        if user_type in compatible_types and other_type in compatible_types[user_type]:
            type_score = 0.8
        else:
            type_score = 0.4
        
        # Rh factor compatibility
        if user_rh == other_rh:
            rh_score = 0.9
        elif user_rh == '+' and other_rh == '-':
            rh_score = 0.7  # Positive can receive from negative
        elif user_rh == '-' and other_rh == '+':
            rh_score = 0.5  # Negative receiving from positive may have issues
        else:
            rh_score = 0.6
        
        # Combine scores
        return (type_score * 0.6) + (rh_score * 0.4)
    
    def _calculate_disability_score(self, user_disability: str, other_disability: str) -> float:
        """Calculate disability compatibility score (0-1)"""
        if not other_disability:
            return 0.5
        
        # Normalize
        user_disable = user_disability.lower()
        other_disable = other_disability.lower()
        
        # Terms indicating no disability
        no_disability = ['no', 'none', 'normal', 'healthy', 'able-bodied', 'not applicable', 'na']
        has_disability = ['yes', 'partial', 'disabled', 'handicapped', 'challenged']
        
        user_no = any(term in user_disable for term in no_disability)
        other_no = any(term in other_disable for term in no_disability)
        user_has = any(term in user_disable for term in has_disability)
        other_has = any(term in other_disable for term in has_disability)
        
        # Both have no disability
        if (user_no or not user_has) and (other_no or not other_has):
            return 1.0
        
        # Both have disability
        if user_has and other_has:
            # Check if similar disability
            user_words = set(user_disable.split())
            other_words = set(other_disable.split())
            common_words = user_words & other_words
            if len(common_words) > 1:
                return 0.7  # Similar disabilities
            else:
                return 0.5  # Different disabilities
        
        # One has, one doesn't
        return 0.3
    
    def _apply_bonuses(self, user_profile: Dict, other_profile: Dict, base_score: float) -> float:
        """Apply bonuses to the base score"""
        final_score = base_score
        
        # 1. Premium user bonus
        if user_profile.get('membershipPlan') == 'premium':
            final_score = min(100, final_score * 1.05)
        
        # 2. Profile completeness bonus
        completeness = self._calculate_completeness(other_profile)
        if completeness >= 0.9:
            final_score = min(100, final_score + 3)
        elif completeness >= 0.7:
            final_score = min(100, final_score + 1)
        
        # 3. Profile photo bonus
        if other_profile.get('personalInfo', {}).get('profileImg'):
            final_score = min(100, final_score + 2)
        
        return final_score
    
    def _calculate_completeness(self, profile: Dict) -> float:
        """Calculate profile completeness (0-1)"""
        important_fields = [
            ('personalInfo', 'fullName'),
            ('personalInfo', 'age'),
            ('personalInfo', 'height'),
            ('personalInfo', 'maritalStatus'),
            ('locationInfo', 'currentLocation'),
            ('educationInfo', 'highestEducation'),
            ('careerInfo', 'profession'),
            ('careerInfo', 'employmentType'),
            ('religionInfo', 'motherTongue'),
            ('familyInfo', 'nativePlace')
        ]
        
        filled = 0
        for section, field in important_fields:
            value = profile.get(section, {}).get(field, '')
            if value and str(value).strip() and str(value).strip().lower() not in ['', 'none', 'null']:
                filled += 1
        
        return filled / len(important_fields)
    
    async def get_matches_for_user(self, user_email: str, limit: int = 20) -> List[Dict]:
        """Get matches for a specific user with strict rules"""
        try:
            # Get user profile
            user_profile = await self.get_profile_by_email(user_email)
            if not user_profile:
                print(f"Profile not found for email: {user_email}")
                return []
            
            # Check if profile is published
            if not user_profile.get('isPublished', False):
                print(f"Profile not published for: {user_email}")
                return []
            
            # Get strict rule values
            user_religion = self._clean_text(user_profile.get('religionInfo', {}).get('religion', ''))
            user_caste = self._clean_text(user_profile.get('religionInfo', {}).get('caste', ''))
            user_state = self._clean_text(user_profile.get('locationInfo', {}).get('state', ''))
            
            if not user_religion or not user_state:
                print(f"User missing required fields (religion/state): {user_email}")
                return []
            
            # Get all published profiles
            all_profiles = await self.get_all_published_profiles()
            
            matches = []
            for profile in all_profiles:
                # Skip self
                if profile.get('email') == user_email:
                    continue
                
                # Gender check
                user_gender = self._clean_text(user_profile.get('personalInfo', {}).get('gender', ''))
                profile_gender = self._clean_text(profile.get('personalInfo', {}).get('gender', ''))
                
                if user_gender == profile_gender:
                    continue
                
                # Strict rules check
                profile_religion = self._clean_text(profile.get('religionInfo', {}).get('religion', ''))
                profile_caste = self._clean_text(profile.get('religionInfo', {}).get('caste', ''))
                profile_state = self._clean_text(profile.get('locationInfo', {}).get('state', ''))
                
                # 1. Same religion
                if not profile_religion or profile_religion != user_religion:
                    continue
                
                # 2. Same caste (if user specified)
                if user_caste and user_caste not in ['', 'any', 'no preference', 'none', 'doesnt matter', 'no']:
                    if not profile_caste or profile_caste in ['', 'any', 'no preference', 'none'] or profile_caste != user_caste:
                        continue
                
                # 3. Same state
                if not profile_state or profile_state != user_state:
                    continue
                
                # Calculate match score
                score = self.calculate_match_score(user_profile, profile)
                status = await self.get_user_status(profile.get("email"))
                
                # Only include matches with decent score
                if score >= 50:
                    match_data = {
                        'email': profile.get('email'),
                        'fullName': profile.get('personalInfo', {}).get('fullName', ''),
                        'age': profile.get('personalInfo', {}).get('age', ''),
                        'height': profile.get('personalInfo', {}).get('height', ''),
                        'weight': profile.get('personalInfo', {}).get('weight', ''),
                        'bloodGroup': profile.get('personalInfo', {}).get('bloodGroup', ''),
                        'gender': profile.get('personalInfo', {}).get('gender', ''),
                        'disability': profile.get('personalInfo', {}).get('disability', 'No'),
                        'state': profile.get('locationInfo', {}).get('state', ''),
                        'location': profile.get('locationInfo', {}).get('city', ''),
                        'currentLocation': profile.get('locationInfo', {}).get('currentLocation', ''),
                        'education': profile.get('educationInfo', {}).get('highestEducation', ''),
                        'profession': profile.get('careerInfo', {}).get('profession', ''),
                        'annualIncome': profile.get('careerInfo', {}).get('annualIncome', ''),
                        'employmentType': profile.get('careerInfo', {}).get('employmentType', ''),
                        'profileImg': profile.get('personalInfo', {}).get('profileImg', ''),
                        'matchScore': score,
                        'maritalStatus': profile.get('personalInfo', {}).get('maritalStatus', ''),
                        'religion': profile.get('religionInfo', {}).get('religion', ''),
                        'caste': profile.get('religionInfo', {}).get('caste', ''),
                        'contactNumber': profile.get('personalInfo', {}).get('contactNumber', ''),
                        'whatsappNumber': profile.get('personalInfo', {}).get('whatsappNumber', ''),
                        'nativePlace': profile.get('familyInfo', {}).get('nativePlace', ''),
                        'motherTongue': profile.get('religionInfo', {}).get('motherTongue', ''),
                        'isOnline': status.get("isOnline", False),
                        'lastSeen': status.get("lastSeen")
                    }
                    
                    matches.append(match_data)
            
            # Sort by score and limit
            matches.sort(key=lambda x: x['matchScore'], reverse=True)
            return matches[:limit]
            
        except Exception as e:
            print(f"Error getting matches: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
    
    async def get_recommended_matches(self, user_email: str, limit: int = 10) -> List[Dict]:
        """Get recommended matches with enhanced scoring"""
        try:
            # Get basic matches first
            matches = await self.get_matches_for_user(user_email, limit=50)
            
            if not matches:
                return []
            
            # Enhance scores
            enhanced_matches = []
            user_profile = await self.get_profile_by_email(user_email)
            
            for match in matches:
                enhanced_score = match['matchScore']
                
                # Get full profile for premium check
                other_profile = await self.get_profile_by_email(match['email'])
                if other_profile:
                    # Premium bonus
                    if other_profile.get('membershipPlan') == 'premium':
                        enhanced_score = min(100, enhanced_score * 1.08)
                
                enhanced_match = match.copy()
                enhanced_match['enhancedScore'] = round(enhanced_score, 2)
                enhanced_matches.append(enhanced_match)
            
            # Sort by enhanced score
            enhanced_matches.sort(key=lambda x: x.get('enhancedScore', x['matchScore']), reverse=True)
            
            return enhanced_matches[:limit]
            
        except Exception as e:
            print(f"Error getting recommended matches: {str(e)}")
            return []