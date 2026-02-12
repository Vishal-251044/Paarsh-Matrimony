# backend/app/controllers/chatbot_controller.py
from datetime import datetime
from typing import Dict, Optional, List
from bson import ObjectId
from app.database import db
import logging

logger = logging.getLogger(__name__)

class ChatbotController:
    
    @staticmethod
    async def initialize_session(user_email: Optional[str] = None):
        session_id = str(ObjectId())
    
        welcome_message = "Namaste! Welcome to our Matrimony platform. I'm here to help you find your perfect life partner. What would you like to know about?"
    
        if user_email:
            profile = await db.profiles.find_one({"email": user_email})
            if profile and profile.get("personalInfo", {}).get("fullName"):
                full_name = profile["personalInfo"]["fullName"]
                name = full_name.split()[0] if full_name else "User"
                welcome_message = f"Namaste {name}! Welcome back to our Matrimony platform. I'm here to help you find your perfect life partner. How can I assist you today?"
    
        return {
            "sessionId": session_id,
            "welcomeMessage": welcome_message
        }

    
    @staticmethod
    async def get_user_profile(email: str) -> Dict:
        """Get user profile data"""
        try:
            profile = await db.profiles.find_one({"email": email})
            if profile:
                if "_id" in profile:
                    profile["_id"] = str(profile["_id"])
                return profile
        except Exception as e:
            logger.error(f"Error fetching profile: {e}")
        return {}
    
    @staticmethod
    async def get_user_watchlist(email: str) -> Dict:
        """Get user watchlist data"""
        try:
            watchlist = await db.watchlists.find_one({"user_email": email})
            if watchlist:
                if "_id" in watchlist:
                    watchlist["_id"] = str(watchlist["_id"])
                return watchlist
        except Exception as e:
            logger.error(f"Error fetching watchlist: {e}")
        return {"partners": []}
    
    @staticmethod
    def _get_missing_fields(profile: Dict) -> str:
        """Get missing profile fields based on actual structure"""
        missing = []
        
        # Personal Information
        personal = profile.get("personalInfo", {})
        if not personal.get("fullName"): missing.append("Full Name")
        if not personal.get("gender"): missing.append("Gender")
        if not personal.get("dob"): missing.append("Date of Birth")
        if not personal.get("age"): missing.append("Age")
        if not personal.get("maritalStatus"): missing.append("Marital Status")
        if not personal.get("height"): missing.append("Height")
        if not personal.get("weight"): missing.append("Weight")
        if not personal.get("bloodGroup"): missing.append("Blood Group")
        if not personal.get("contactNumber"): missing.append("Contact Number")
        if not personal.get("whatsappNumber"): missing.append("WhatsApp Number")
        
        # Location Information
        location = profile.get("locationInfo", {})
        if not location.get("country"): missing.append("Country")
        if not location.get("state"): missing.append("State")
        if not location.get("city"): missing.append("City")
        if not location.get("pinCode"): missing.append("Pin Code")
        if not location.get("currentLocation"): missing.append("Current Location")
        
        # Religion Information
        religion = profile.get("religionInfo", {})
        if not religion.get("religion"): missing.append("Religion")
        if not religion.get("caste"): missing.append("Caste")
        if not religion.get("motherTongue"): missing.append("Mother Tongue")
        
        # Education Information
        education = profile.get("educationInfo", {})
        if not education.get("highestEducation"): missing.append("Highest Education")
        
        # Career Information
        career = profile.get("careerInfo", {})
        if not career.get("profession"): missing.append("Profession")
        if not career.get("annualIncome"): missing.append("Annual Income")
        
        # Family Information
        family = profile.get("familyInfo", {})
        if not family.get("fatherName"): missing.append("Father's Name")
        if not family.get("motherName"): missing.append("Mother's Name")
        
        # Partner Preferences
        partner = profile.get("partnerInfo", {})
        if not partner.get("preferredAgeRange"): missing.append("Preferred Age Range")
        if not partner.get("preferredMaritalStatus"): missing.append("Preferred Marital Status")
        if not partner.get("preferredReligion"): missing.append("Preferred Religion")
        
        # About Sections
        if not profile.get("aboutYourself"): missing.append("About Yourself")
        
        if not missing:
            return "All required fields completed! 🎉"
        
        return "\n".join(f"• {item}" for item in missing[:10])
    
    @staticmethod
    def _format_profile_answer(profile: Dict) -> str:
        """Format profile data as answer showing only filled fields with proper labels"""
        personal = profile.get("personalInfo", {})
        location = profile.get("locationInfo", {})
        religion = profile.get("religionInfo", {})
        education = profile.get("educationInfo", {})
        career = profile.get("careerInfo", {})
        
        membership = profile.get("membershipPlan", "free")
        
        # Build response dynamically based on filled fields
        response_parts = ["**YOUR PROFILE SUMMARY**\n"]
        
        # Personal Details
        personal_details = []
        if personal.get("fullName"):
            personal_details.append(f"Name: {personal['fullName']}")
        if personal.get("age"):
            personal_details.append(f"Age: {personal['age']} years")
        if personal.get("gender"):
            personal_details.append(f"Gender: {personal['gender']}")
        if personal.get("maritalStatus"):
            personal_details.append(f"Marital Status: {personal['maritalStatus']}")
        if personal.get("height"):
            personal_details.append(f"Height: {personal['height']}")
        
        if personal_details:
            response_parts.append("**Personal Details:**")
            for detail in personal_details:
                response_parts.append(f"• {detail}")
            response_parts.append("")
        
        # Location Details
        location_details = []
        if location.get("country"):
            location_details.append(f"Country: {location['country']}")
        if location.get("state"):
            location_details.append(f"State: {location['state']}")
        if location.get("city"):
            location_details.append(f"City: {location['city']}")
        
        if location_details:
            response_parts.append("**Location:**")
            for detail in location_details:
                response_parts.append(f"• {detail}")
            response_parts.append("")
        
        # Religion Details
        religion_details = []
        if religion.get("religion"):
            religion_details.append(f"Religion: {religion['religion']}")
        if religion.get("caste"):
            religion_details.append(f"Caste: {religion['caste']}")
        if religion.get("motherTongue"):
            religion_details.append(f"Mother Tongue: {religion['motherTongue']}")
        
        if religion_details:
            response_parts.append("**Religion:**")
            for detail in religion_details:
                response_parts.append(f"• {detail}")
            response_parts.append("")
        
        # Education & Career
        edu_career = []
        if education.get("highestEducation"):
            edu_career.append(f"Education: {education['highestEducation']}")
        if career.get("profession"):
            edu_career.append(f"Profession: {career['profession']}")
        if career.get("annualIncome"):
            edu_career.append(f"Annual Income: {career['annualIncome']}")
        
        if edu_career:
            response_parts.append("**Education & Career:**")
            for item in edu_career:
                response_parts.append(f"• {item}")
            response_parts.append("")
        
        # Profile Status
        response_parts.append("**Profile Status:**")
        response_parts.append(f"• Membership: {membership.upper()}")
        response_parts.append(f"• Published: {'Yes' if profile.get('isPublished') else 'No'}")
        response_parts.append("")
        
        # Quick actions
        response_parts.append("**Quick Actions:**")
        response_parts.append("• Edit Profile → /profile")
        response_parts.append("• Upload Photo → /profile")
        
        return "\n".join(response_parts)
    
    @staticmethod
    def _format_completion_answer(profile: Dict) -> str:
        """Format profile completion tips based on actual missing fields"""
        missing_fields = ChatbotController._get_missing_fields(profile)
        
        response_parts = ["**COMPLETE YOUR PROFILE**"]
        response_parts.append("")
        response_parts.append("**Missing Information:**")
        response_parts.append(missing_fields)
        response_parts.append("")
        response_parts.append("**Quick Tips to Reach 100%:**")
        response_parts.append("1. Add a profile photo - 3x more profile views")
        response_parts.append("2. Complete personal details - Higher trust score")
        response_parts.append("3. Add education & career - Better matches")
        response_parts.append("4. Set partner preferences - Relevant suggestions")
        response_parts.append("5. Write about yourself - Share your interests")
        response_parts.append("")
        response_parts.append("**Complete Now:**")
        response_parts.append("• Edit Profile → /profile")
        response_parts.append("")
        
        return "\n".join(response_parts)
    
    @staticmethod
    def _format_family_answer(profile: Dict) -> str:
        """Format family data as answer showing only filled fields"""
        family = profile.get("familyInfo", {})
        about_family = profile.get("aboutFamily", "")
        
        response_parts = ["**YOUR FAMILY DETAILS**"]
        response_parts.append("")
        
        # Parents Information
        parents_info = []
        if family.get("fatherName"):
            parents_info.append(f"Father: {family['fatherName']}")
            if family.get("fatherOccupation"):
                parents_info.append(f"  Occupation: {family['fatherOccupation']}")
        if family.get("motherName"):
            parents_info.append(f"Mother: {family['motherName']}")
            if family.get("motherOccupation"):
                parents_info.append(f"  Occupation: {family['motherOccupation']}")
        
        if parents_info:
            response_parts.append("**Parents:**")
            for info in parents_info:
                response_parts.append(f"• {info}")
            response_parts.append("")
        
        # Siblings Information
        if family.get("brothers") is not None or family.get("sisters") is not None:
            siblings_info = []
            if family.get("brothers") is not None:
                siblings_info.append(f"Brothers: {family['brothers']}")
            if family.get("sisters") is not None:
                siblings_info.append(f"Sisters: {family['sisters']}")
            
            if siblings_info:
                response_parts.append("**Siblings:**")
                for info in siblings_info:
                    response_parts.append(f"• {info}")
                response_parts.append("")
        
        # Family Background
        family_background = []
        if family.get("familyType"):
            family_background.append(f"Family Type: {family['familyType']}")
        if family.get("familyStatus"):
            family_background.append(f"Family Status: {family['familyStatus']}")
        if family.get("familyLocation"):
            family_background.append(f"Family Location: {family['familyLocation']}")
        
        if family_background:
            response_parts.append("**Family Background:**")
            for bg in family_background:
                response_parts.append(f"• {bg}")
            response_parts.append("")
        
        # About Family
        if about_family and about_family.strip():
            response_parts.append("**About Family:**")
            about_preview = about_family[:150] + "..." if len(about_family) > 150 else about_family
            response_parts.append(f"• {about_preview}")
            response_parts.append("")
        
        # Edit link
        response_parts.append("**Update Family Details:**")
        response_parts.append("• Edit → Profile → Family Information")
        response_parts.append("")
                
        return "\n".join(response_parts)
    
    @staticmethod
    def _format_partner_answer(profile: Dict) -> str:
        """Format partner preferences as answer showing only filled fields"""
        partner = profile.get("partnerInfo", {})
        
        response_parts = ["**YOUR PARTNER PREFERENCES**"]
        response_parts.append("")
        
        # Basic Preferences
        basic_prefs = []
        if partner.get("preferredAgeRange"):
            basic_prefs.append(f"Age Range: {partner['preferredAgeRange']}")
        if partner.get("preferredHeight"):
            basic_prefs.append(f"Height: {partner['preferredHeight']}")
        if partner.get("preferredMaritalStatus"):
            basic_prefs.append(f"Marital Status: {partner['preferredMaritalStatus']}")
        if partner.get("lookingFor"):
            basic_prefs.append(f"Looking For: {partner['lookingFor']}")
        
        if basic_prefs:
            response_parts.append("**Basic Preferences:**")
            for pref in basic_prefs:
                response_parts.append(f"• {pref}")
            response_parts.append("")
        
        # Religious & Cultural
        religious_prefs = []
        if partner.get("preferredReligion"):
            religious_prefs.append(f"Religion: {partner['preferredReligion']}")
        if partner.get("preferredCaste"):
            religious_prefs.append(f"Caste: {partner['preferredCaste']}")
        if partner.get("preferredMotherTongue"):
            religious_prefs.append(f"Mother Tongue: {partner['preferredMotherTongue']}")
        
        if religious_prefs:
            response_parts.append("**Religious & Cultural:**")
            for pref in religious_prefs:
                response_parts.append(f"• {pref}")
            response_parts.append("")
        
        # Professional
        professional_prefs = []
        if partner.get("preferredEducation"):
            professional_prefs.append(f"Education: {partner['preferredEducation']}")
        if partner.get("preferredProfession"):
            professional_prefs.append(f"Profession: {partner['preferredProfession']}")
        if partner.get("preferredIncome"):
            professional_prefs.append(f"Income: {partner['preferredIncome']}")
        
        if professional_prefs:
            response_parts.append("**Professional:**")
            for pref in professional_prefs:
                response_parts.append(f"• {pref}")
            response_parts.append("")
        
        # Location
        location_prefs = []
        if partner.get("preferredLocation"):
            location_prefs.append(f"Preferred Location: {partner['preferredLocation']}")
        if partner.get("settledIn"):
            location_prefs.append(f"Settled In: {partner['settledIn']}")
        
        if location_prefs:
            response_parts.append("**Location:**")
            for pref in location_prefs:
                response_parts.append(f"• {pref}")
            response_parts.append("")
        
        # Edit link
        response_parts.append("**Update Preferences:**")
        response_parts.append("• Edit → Profile → Partner Preferences")
        response_parts.append("")
                
        return "\n".join(response_parts)
    
    @staticmethod
    def _format_watchlist_answer(watchlist: Dict, profile: Dict) -> str:
        """Format watchlist data as answer with correct limits"""
        partners = watchlist.get("partners", [])
        watchlist_count = len(partners)
        
        # Fix: Free users can add up to 50 profiles, Premium unlimited
        membership = profile.get('membershipPlan', 'free')
        
        response_parts = [f"**YOUR WATCHLIST ({watchlist_count})**"]
        response_parts.append("")
        
        if partners:
            watchlist_text = []
            for i, p in enumerate(partners[:5], 1):
                email = p.get('partner_email', 'Unknown')
                name = email.split('@')[0] if '@' in email else email
                score = p.get('match_score', 0)
                watchlist_text.append(f"{i}. {name} - {score}% match")
            
            response_parts.append("\n".join(watchlist_text))
            response_parts.append("")
            
            if watchlist_count > 5:
                response_parts.append(f"...and {watchlist_count - 5} more profiles")
                response_parts.append("")
            
            # Calculate average match score
            if partners:
                total_score = sum(p.get('match_score', 0) for p in partners[:5])
                avg_score = total_score / min(5, watchlist_count)
                response_parts.append(f"**Average Match:** {avg_score:.1f}%")
                response_parts.append("")
            
            # Show remaining capacity
            if membership.lower() == 'free':
                remaining = max(0, 50 - watchlist_count)
                response_parts.append(f"**Remaining slots:** {remaining}/50")
                response_parts.append("")
            
            response_parts.append("**Actions:**")
            response_parts.append("• View Full Watchlist → /watchlist")
            response_parts.append("• Send Interest to top matches")
            response_parts.append("• Remove profiles you've contacted")
            response_parts.append("")
        else:
            response_parts.append("Your watchlist is empty. Start adding interesting profiles while browsing matches!")
            if membership.lower() == 'free':
                response_parts.append("")
                response_parts.append("**Free Plan:** You can not add profiles to your watchlist.")
            else:
                response_parts.append("")
                response_parts.append("**Premium Plan:** Add unlimited profiles to your watchlist.")
        
        return "\n".join(response_parts)
    
    @staticmethod
    def _format_age_preference_answer(profile: Dict) -> str:
        """Format age preference guidance"""
        personal = profile.get("personalInfo", {})
        partner = profile.get("partnerInfo", {})
        current_age = personal.get('age', 'Not specified')
        age_pref = partner.get('preferredAgeRange', 'Not set')
        
        response_parts = ["**AGE PREFERENCE GUIDE**"]
        response_parts.append("")
        response_parts.append(f"**Your Age:** {current_age} years")
        response_parts.append(f"**Your Preference:** {age_pref}")
        response_parts.append("")
        response_parts.append("**Match Statistics:**")
        response_parts.append("• **2-4 years difference:** Most common (65% of matches)")
        response_parts.append("  ✓ Ideal for similar life stage")
        response_parts.append("  ✓ Highest compatibility rate")
        response_parts.append("")
        response_parts.append("• **5-7 years difference:** Moderate (25% of matches)")
        response_parts.append("  ✓ 70% of women prefer older men (2-5 years)")
        response_parts.append("  ✓ 60% of men prefer younger women (3-6 years)")
        response_parts.append("")
        response_parts.append("**Recommendations:**")
        response_parts.append("• **Flexible Range:** +-3-4 years gives you 2x more match options")
        response_parts.append("• **Ideal Gap:** 3-5 years difference has highest success rate")
        response_parts.append("")
        response_parts.append("**Update your preference:**")
        response_parts.append("• Profile → Partner Preferences → Age Range")
        response_parts.append("")
        
        return "\n".join(response_parts)
    
    @staticmethod
    def _format_income_preference_answer(profile: Dict) -> str:
        """Format income preference guidance"""
        current_income = profile.get("careerInfo", {}).get("annualIncome", "Not specified")
        partner = profile.get("partnerInfo", {})
        income_pref = partner.get('preferredIncome', 'Not set')
        
        response_parts = ["**INCOME PREFERENCE GUIDE**"]
        response_parts.append("")
        response_parts.append(f"**Your Annual Income:** {current_income}")
        response_parts.append(f"**Your Preference:** {income_pref}")
        response_parts.append("")
        response_parts.append("**Match Preferences:**")
        response_parts.append("• **Similar Income (+-20%):** 55% of users")
        response_parts.append("• **Higher Income Partner:** 30% of users")
        response_parts.append("• **No Preference:** 15% of users (40% more matches)")
        response_parts.append("")
        response_parts.append("**Smart Strategy:**")
        response_parts.append("• **No Preference** - Get 40% more matches, filter later")
        response_parts.append("• **Specific Range** - Focused search, higher quality matches")
        response_parts.append("")
        
        return "\n".join(response_parts)
    
    @staticmethod
    def _format_height_preference_answer(profile: Dict) -> str:
        """Format height preference guidance"""
        current_height = profile.get("personalInfo", {}).get("height", "Not specified")
        partner = profile.get("partnerInfo", {})
        height_pref = partner.get('preferredHeight', 'Not set')
        
        response_parts = ["**HEIGHT PREFERENCE GUIDE**"]
        response_parts.append("")
        response_parts.append(f"**Your Height:** {current_height}")
        response_parts.append(f"**Your Preference:** {height_pref}")
        response_parts.append("")
        response_parts.append("**Common Preferences:**")
        response_parts.append("**Women (prefer men):**")
        response_parts.append("• 4-6 inches taller: 70%")
        response_parts.append("• 2-3 inches taller: 20%")
        response_parts.append("")
        response_parts.append("**Men (prefer women):**")
        response_parts.append("• 2-5 inches shorter: 65%")
        response_parts.append("• Same height: 25%")
        response_parts.append("")
        response_parts.append("**Pro Tip:**")
        response_parts.append("Being open to **+-2 inches** from your preference **doubles** your potential matches!")
        response_parts.append("")
        
        return "\n".join(response_parts)
    
    @staticmethod
    async def process_question(session_id: str, user_email: Optional[str], category: str, question_id: str):
        """Process user question and return appropriate answer"""
        
        # Initialize data
        profile_data = {}
        watchlist_data = {"partners": []}
        
        # Get user data if logged in
        if user_email:
            profile_data = await ChatbotController.get_user_profile(user_email)
            watchlist_data = await ChatbotController.get_user_watchlist(user_email)
        
        answer = None
        
        # PERSONALIZED CATEGORIES - require login
        if user_email:
            if category == "self":
                if question_id == "view_self":
                    answer = ChatbotController._format_profile_answer(profile_data)
                elif question_id == "edit_self" or question_id == "update_self":
                    answer = ChatbotController._format_completion_answer(profile_data)
                elif question_id == "tips_self":
                    answer = "**Profile Tips:**\n\n• **Add a clear photo** - Profiles with photos get 3x more responses\n• **Complete all sections** - 100% complete profiles get 5x more matches\n• **Verify your profile** - Verified badge increases trust\n• **Set clear partner preferences** - Get relevant suggestions\n• **Write about yourself** - Share your interests and values"
                elif question_id == "privacy_self":
                    answer = "**Privacy Settings:**\n\n• **Profile Visibility:** Go to Profile Settings → Privacy\n• **Photo Visibility:** Control who sees your photos\n• **Contact Details:** Hide/show contact information\n• **Hide Profile:** Temporarily hide your profile from searches\n"
                else:
                    answer = ChatbotController._format_profile_answer(profile_data)
            
            elif category == "family":
                if question_id == "view_family":
                    answer = ChatbotController._format_family_answer(profile_data)
                elif question_id == "edit_family" or question_id == "update_family":
                    answer = "**Edit Family Details:**\n\nGo to **Profile → Family Information** to add or update:\n\n• Father's Name & Occupation\n• Mother's Name & Occupation\n• Number of Brothers & Sisters\n• Family Type (Joint/Nuclear)\n• Family Status (Middle class/Affluent)\n• About Your Family\n\nAdding family details increases trust and matching success by 40%!"
                elif question_id == "tips_family":
                    answer = "**Family Tips:**\n\n• Add both parents' names for authenticity\n• Mention family values and traditions\n• Describe your family background briefly\n• Select accurate family type and status\n• Share your family's native place\n\nProfiles with complete family details get **2x more interested responses**!"
                elif question_id == "privacy_family":
                    answer = "**Family Privacy:**\n\n• Family details are **only visible** to users in your watchlist\n• You can control visibility in Privacy Settings\n• About Family section can be hidden from free plan users\n"
                else:
                    answer = ChatbotController._format_family_answer(profile_data)
            
            elif category == "partner":
                if question_id == "view_partner":
                    answer = ChatbotController._format_partner_answer(profile_data)
                elif question_id == "edit_partner" or question_id == "update_partner":
                    answer = "**Edit Partner Preferences:**\n\nGo to **Profile → Partner Preferences** to update:\n\n• Age Range\n• Height\n• Marital Status\n• Religion & Caste\n• Education & Profession\n• Income Range\n• Location\n\nClear preferences improve match quality significantly!"
                elif question_id == "age_preference":
                    answer = ChatbotController._format_age_preference_answer(profile_data)
                elif question_id == "income_preference":
                    answer = ChatbotController._format_income_preference_answer(profile_data)
                elif question_id == "height_preference":
                    answer = ChatbotController._format_height_preference_answer(profile_data)
                elif question_id == "tips_partner":
                    answer = "**Partner Preference Tips:**\n\n• **Age:** +-3-4 years flexibility doubles matches\n• **Income:** 'No Preference' gives 40% more options\n• **Height:** +-2 inches flexibility triples matches\n• **Education:** Broad categories > specific degrees\n• **Location:** Willingness to relocate = more matches"
                else:
                    answer = ChatbotController._format_partner_answer(profile_data)
            
            elif category == "watchlist":
                if question_id == "view_watchlist":
                    answer = ChatbotController._format_watchlist_answer(watchlist_data, profile_data)
                elif question_id == "add_to_watchlist":
                    membership = profile_data.get('membershipPlan', 'free')
                    if membership.lower() == 'free':
                        current = len(watchlist_data.get("partners", []))
                        remaining = max(0, 50 - current)
                        answer = f"**Add to Watchlist:**\n\nClick the **+ Add to Watchlist** button on any profile to save them.\n\n**Free Plan:** **Upgrade to Premium** for unlimited watchlist!"
                    else:
                        answer = "**Add to Watchlist:**\n\nClick the **+ Add to Watchlist** button on any profile to save them.\n\n**Premium Plan:** Add unlimited profiles to your watchlist!"
                elif question_id == "remove_from_watchlist":
                    answer = "**Remove from Watchlist:**\n\n• Go to **Watchlist** page and click **Remove** on any profile\n• Or click the **Remove** button on their profile page\n• Regular cleanup improves recommendations\n\n**Tip:** Remove profiles you've already contacted"
                elif question_id == "watchlist_limits":
                    membership = profile_data.get('membershipPlan', 'free')
                    current = len(watchlist_data.get("partners", []))
                    if membership.lower() == 'free':
                        remaining = max(0, 50 - current)
                        answer = f"**Watchlist Limits:**\n\n**Free Plan:** No Watchlist feature.\n\n**Premium Plan:** Unlimited profiles\n• Upgrade for unlimited watchlist!"
                    else:
                        answer = f"**Watchlist Limits:**\n\n**Premium Plan:** Unlimited profiles\n• Current: {current} profiles\n• No limits on adding more!"
                else:
                    answer = ChatbotController._format_watchlist_answer(watchlist_data, profile_data)
        
        # Default answers if no specific match or not logged in
        if not answer:
            if not user_email:
                answer = "**Please login to access personalized information** about your profile, family, partner preferences, and watchlist.\n\n[Login](/login) or [Register](/register) for free!"
            elif category == "self":
                answer = "**My Profile Options:**\n\n• View Profile Summary\n• Complete Profile\n• Privacy Settings\n• Profile Tips\n\nSelect a specific question above!"
            elif category == "family":
                answer = "**Family Options:**\n\n• View Family Details\n• Edit Family Information\n• Family Tips\n• Family Privacy\n\nSelect a specific question above!"
            elif category == "partner":
                answer = "**Partner Preference Options:**\n\n• View Preferences\n• Age Guide\n• Income Guide\n• Height Guide\n• Tips\n\nSelect a specific question above!"
            elif category == "watchlist":
                answer = "**Watchlist Options:**\n\n• View Watchlist\n• Add to Watchlist\n• Remove from Watchlist\n• Watchlist Limits\n\nSelect a specific question above!"
            else:
                answer = f"I understand you're asking about **{category}**. Please select a specific question from the options above."
        
        # Generate follow-up suggestions
        suggestions = []
        if user_email:
            if category == "self":
                suggestions = [
                    {"id": "view_self", "question": "View my profile"},
                    {"id": "edit_self", "question": "Complete profile"},
                    {"id": "privacy_self", "question": "Privacy settings"}
                ]
            elif category == "family":
                suggestions = [
                    {"id": "view_family", "question": "View family"},
                    {"id": "edit_family", "question": "Edit family"},
                    {"id": "tips_family", "question": "Family tips"}
                ]
            elif category == "partner":
                suggestions = [
                    {"id": "view_partner", "question": "View preferences"},
                    {"id": "age_preference", "question": "Age guide"},
                    {"id": "income_preference", "question": "Income guide"}
                ]
            elif category == "watchlist":
                suggestions = [
                    {"id": "view_watchlist", "question": "View watchlist"},
                    {"id": "add_to_watchlist", "question": "Add to watchlist"},
                    {"id": "watchlist_limits", "question": "Watchlist limits"}
                ]
        else:
            suggestions = [
                {"id": "login", "question": "How to login?"},
                {"id": "register", "question": "Create account?"},
                {"id": "browse", "question": "Browse profiles?"}
            ]
        
        return {
            "answer": answer,
            "suggestions": suggestions[:3],
            "category": category,
            "question_id": question_id
        }
    
    @staticmethod
    async def get_category_questions(category: str, user_email: Optional[str] = None):
        """Get main questions for a specific category"""
        
        # Check if user is logged in for personalized categories
        if category in ["self", "family", "partner", "watchlist"] and not user_email:
            return [
                {"id": "login_required", "question": "Login to access this information"}
            ]
        
        questions = []
        
        if category == "self":
            questions = [
                {"id": "view_self", "question": "View my profile summary"},
                {"id": "edit_self", "question": "How to complete my profile?"},
                {"id": "privacy_self", "question": "Privacy settings?"},
                {"id": "tips_self", "question": "Profile tips?"}
            ]
        elif category == "family":
            questions = [
                {"id": "view_family", "question": "View my family details"},
                {"id": "edit_family", "question": "Edit family information"},
                {"id": "tips_family", "question": "Family tips"},
                {"id": "privacy_family", "question": "Family privacy"}
            ]
        elif category == "partner":
            questions = [
                {"id": "view_partner", "question": "View partner preferences"},
                {"id": "age_preference", "question": "Age preference guide"},
                {"id": "income_preference", "question": "Income preference guide"},
                {"id": "height_preference", "question": "Height preference guide"},
                {"id": "tips_partner", "question": "Partner preference tips"}
            ]
        elif category == "watchlist":
            questions = [
                {"id": "view_watchlist", "question": "View my watchlist"},
                {"id": "add_to_watchlist", "question": "Add to watchlist"},
                {"id": "remove_from_watchlist", "question": "Remove from watchlist"},
                {"id": "watchlist_limits", "question": "Watchlist limits"}
            ]
        
        return questions

# Export controller functions
async def init_chat_session(user_email=None):
    return await ChatbotController.initialize_session(user_email)

async def process_chat_question(session_id, user_email, category, question_id):
    return await ChatbotController.process_question(session_id, user_email, category, question_id)

async def get_category_questions(category, user_email=None):
    return await ChatbotController.get_category_questions(category, user_email)