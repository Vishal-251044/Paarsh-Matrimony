# app/models/Profile.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict

class PersonalInfo(BaseModel):
    profileImg: Optional[str] = ""
    fullName: Optional[str] = ""
    gender: Optional[str] = ""
    dob: Optional[str] = ""
    age: Optional[str] = ""
    maritalStatus: Optional[str] = ""
    height: Optional[str] = ""
    weight: Optional[str] = ""
    bloodGroup: Optional[str] = ""
    disability: Optional[str] = "No"
    contactNumber: Optional[str] = ""
    whatsappNumber: Optional[str] = ""
    
    @validator('contactNumber', 'whatsappNumber')
    def validate_phone_number(cls, v):
        if v and v.strip():  # Only validate if value is provided
            # Remove any non-digit characters
            digits = ''.join(filter(str.isdigit, v))
            # Check if it's a valid Indian mobile number (10 digits starting with 6-9)
            if len(digits) == 10 and digits[0] in '6789':
                return digits
            else:
                raise ValueError('Invalid phone number. Must be a valid 10-digit Indian mobile number.')
        return v

class LocationInfo(BaseModel):
    country: Optional[str] = "India"
    state: Optional[str] = ""
    city: Optional[str] = ""
    pinCode: Optional[str] = ""
    currentLocation: Optional[str] = ""
    permanentAddress: Optional[str] = ""

class ReligionInfo(BaseModel):
    religion: Optional[str] = ""
    caste: Optional[str] = ""
    motherTongue: Optional[str] = ""
    gothra: Optional[str] = ""
    rashi: Optional[str] = ""

class EducationInfo(BaseModel):
    highestEducation: Optional[str] = ""
    yearOfPassing: Optional[str] = ""
    university: Optional[str] = ""

class CareerInfo(BaseModel):
    profession: Optional[str] = ""
    jobTitle: Optional[str] = ""
    companyName: Optional[str] = ""
    employmentType: Optional[str] = "Private"
    annualIncome: Optional[str] = ""
    workLocation: Optional[str] = ""

class FamilyInfo(BaseModel):
    fatherName: Optional[str] = ""
    fatherOccupation: Optional[str] = ""
    motherName: Optional[str] = ""
    motherOccupation: Optional[str] = ""
    brothers: Optional[int] = 0
    sisters: Optional[int] = 0
    familyType: Optional[str] = "Nuclear"
    familyStatus: Optional[str] = "Middle"
    familyLocation: Optional[str] = ""
    nativePlace: Optional[str] = ""

class PartnerInfo(BaseModel):
    preferredAgeRange: Optional[str] = ""
    preferredHeight: Optional[str] = ""
    preferredMaritalStatus: Optional[str] = "Never Married"
    preferredReligion: Optional[str] = ""
    preferredCaste: Optional[str] = ""
    preferredMotherTongue: Optional[str] = ""
    preferredEducation: Optional[str] = ""
    preferredProfession: Optional[str] = ""
    preferredLocation: Optional[str] = ""
    preferredIncome: Optional[str] = ""
    settledIn: Optional[str] = ""
    lookingFor: Optional[str] = ""

class Profile(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "personalInfo": {
                    "fullName": "Vishal Chavan",
                    "gender": "Male",
                    "dob": "2004-02-24",
                    "age": "22",
                    "maritalStatus": "Never Married",
                    "contactNumber": "9999999999",
                    "whatsappNumber": "9999999999"
                }
            }
        }
    )
    
    email: EmailStr
    personalInfo: PersonalInfo = PersonalInfo()
    locationInfo: LocationInfo = LocationInfo()
    religionInfo: ReligionInfo = ReligionInfo()
    educationInfo: EducationInfo = EducationInfo()
    careerInfo: CareerInfo = CareerInfo()
    familyInfo: FamilyInfo = FamilyInfo()
    partnerInfo: PartnerInfo = PartnerInfo()
    aboutYourself: Optional[str] = ""
    aboutFamily: Optional[str] = ""
    membershipPlan: Optional[str] = "free"
    isPublished: Optional[bool] = False
    publishedDate: Optional[str] = ""
    createdDate: Optional[str] = Field(default_factory=lambda: datetime.now().isoformat())
    lastUpdated: Optional[str] = Field(default_factory=lambda: datetime.now().isoformat())