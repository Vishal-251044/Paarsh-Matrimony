from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Optional
import logging

from app.models.Activity import Interest, Report, InterestStatus, ReportStatus
from app.models.Chat import Conversation, Message, ConversationParticipant
from app.utils.helpers import serialize_document

logger = logging.getLogger(__name__)

class ActivityChatController:
    def __init__(self, db):
        self.db = db
        self.interests_collection = db.interests
        self.reports_collection = db.reports
        self.conversations_collection = db.conversations
        self.messages_collection = db.messages
        self.profiles_collection = db.profiles
        self.users_collection = db.users

    # ==================== Helper Methods ====================
    
    async def _get_user_membership(self, email: str) -> str:
        """Get user's membership type"""
        try:
            user = await self.users_collection.find_one({"email": email})
            if not user:
                return "free"
            return user.get("membershipType", "free")
        except Exception as e:
            logger.error(f"Error getting user membership: {str(e)}")
            return "free"

    async def _get_user_profile_img(self, email: str) -> str:
        """Get user's profile image"""
        try:
            profile = await self.profiles_collection.find_one({"email": email})
            if profile and "personalInfo" in profile:
                return profile["personalInfo"].get("profileImg", "")
            return ""
        except Exception:
            return ""

    # ==================== Interest Methods ====================
    
    async def send_interest(self, interest_data: dict) -> dict:
        """Send a new interest (Available to all users)"""
        try:
            sender_email = interest_data.get("sender_email")
            receiver_email = interest_data.get("receiver_email")
            
            # Validate required fields
            if not sender_email or not receiver_email:
                return {
                    "success": False,
                    "error": "Sender and receiver emails are required"
                }
            
            if not interest_data.get("sender_name") or not interest_data.get("receiver_name"):
                return {
                    "success": False,
                    "error": "Sender and receiver names are required"
                }
            
            # Check if trying to send interest to self
            if sender_email == receiver_email:
                return {
                    "success": False,
                    "error": "Cannot send interest to yourself"
                }
            
            # Check if interest already exists (pending or accepted)
            existing = await self.interests_collection.find_one({
                "sender_email": sender_email,
                "receiver_email": receiver_email,
                "status": {"$in": ["pending", "accepted"]}
            })
            
            if existing:
                return {
                    "success": False,
                    "error": "Interest already sent and is pending or accepted"
                }
            
            # Check if already rejected (can send again after 30 days)
            thirty_days_ago = datetime.now() - timedelta(days=30)
            rejected = await self.interests_collection.find_one({
                "sender_email": sender_email,
                "receiver_email": receiver_email,
                "status": "rejected",
                "updated_at": {"$gte": thirty_days_ago}
            })
            
            if rejected:
                days_remaining = (rejected["updated_at"] + timedelta(days=30) - datetime.now()).days
                return {
                    "success": False,
                    "error": f"Cannot send interest yet. Please try again in {days_remaining} days."
                }
            
            # Get profile images
            sender_profile_img = await self._get_user_profile_img(sender_email)
            receiver_profile_img = await self._get_user_profile_img(receiver_email)
            
            # Get sender membership for tracking
            sender_membership = await self._get_user_membership(sender_email)
            
            # Create interest object
            interest = {
                "sender_email": sender_email,
                "receiver_email": receiver_email,
                "sender_name": interest_data.get("sender_name", ""),
                "receiver_name": interest_data.get("receiver_name", ""),
                "message": interest_data.get("message", ""),
                "sender_profile_img": sender_profile_img,
                "receiver_profile_img": receiver_profile_img,
                "sender_membership": sender_membership,
                "status": "pending",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            result = await self.interests_collection.insert_one(interest)
            
            # Get the inserted document to return
            inserted_interest = await self.interests_collection.find_one({"_id": result.inserted_id})
            if inserted_interest:
                inserted_interest = serialize_document(inserted_interest)
            
            return {
                "success": True,
                "interest_id": str(result.inserted_id),
                "interest": inserted_interest,
                "message": "Interest sent successfully"
            }
        except Exception as e:
            logger.error(f"Error sending interest: {str(e)}")
            return {"success": False, "error": str(e)}

    async def accept_interest(self, interest_id: str, accepter_email: str) -> dict:
        """Accept an interest and create a conversation (Available to all users)"""
        try:
            # Validate interest_id
            if not interest_id or interest_id == "None" or interest_id == "null":
                return {"success": False, "error": "Invalid interest ID"}
            
            # Get interest details
            interest = await self.interests_collection.find_one(
                {"_id": ObjectId(interest_id)}
            )
            
            if not interest:
                return {"success": False, "error": "Interest not found"}
            
            # Verify that accepter is the receiver
            if interest["receiver_email"] != accepter_email:
                return {"success": False, "error": "Unauthorized to accept this interest"}
            
            # Check if interest is still pending
            if interest["status"] != "pending":
                return {"success": False, "error": f"This interest is no longer pending (current status: {interest['status']})"}
            
            # Update interest status
            result = await self.interests_collection.update_one(
                {"_id": ObjectId(interest_id)},
                {
                    "$set": {
                        "status": InterestStatus.ACCEPTED.value,
                        "updated_at": datetime.now()
                    }
                }
            )
            
            if result.modified_count == 0:
                return {"success": False, "error": "Failed to update interest"}
            
            # Check if conversation already exists
            existing_conv = await self.conversations_collection.find_one({
                "interest_id": interest_id
            })
            
            if existing_conv:
                existing_conv = serialize_document(existing_conv)
                return {
                    "success": True,
                    "conversation_id": str(existing_conv["_id"]),
                    "message": "Conversation already exists"
                }
            
            # Get updated profile images
            sender_profile_img = await self._get_user_profile_img(interest["sender_email"])
            receiver_profile_img = await self._get_user_profile_img(interest["receiver_email"])
            
            # Create conversation
            participants = [
                {
                    "email": interest["sender_email"],
                    "name": interest["sender_name"],
                    "profile_img": sender_profile_img or interest.get("sender_profile_img", "")
                },
                {
                    "email": interest["receiver_email"],
                    "name": interest["receiver_name"],
                    "profile_img": receiver_profile_img or interest.get("receiver_profile_img", "")
                }
            ]
            
            conversation = {
                "participants": participants,
                "interest_id": interest_id,
                "unread_count": {
                    interest["sender_email"]: 0,
                    interest["receiver_email"]: 0
                },
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            conv_result = await self.conversations_collection.insert_one(conversation)
            
            return {
                "success": True,
                "conversation_id": str(conv_result.inserted_id),
                "message": "Interest accepted"
            }
        except Exception as e:
            logger.error(f"Error accepting interest: {str(e)}")
            return {"success": False, "error": str(e)}

    async def reject_interest(self, interest_id: str, rejecter_email: str) -> dict:
        """Reject an interest (Available to all users)"""
        try:
            # Validate interest_id
            if not interest_id or interest_id == "None" or interest_id == "null":
                return {"success": False, "error": "Invalid interest ID"}
            
            # Get interest details
            interest = await self.interests_collection.find_one(
                {"_id": ObjectId(interest_id)}
            )
            
            if not interest:
                return {"success": False, "error": "Interest not found"}
            
            # Verify that rejecter is the receiver
            if interest["receiver_email"] != rejecter_email:
                return {"success": False, "error": "Unauthorized to reject this interest"}
            
            # Check if interest is still pending
            if interest["status"] != "pending":
                return {"success": False, "error": f"This interest is no longer pending (current status: {interest['status']})"}
            
            result = await self.interests_collection.update_one(
                {"_id": ObjectId(interest_id)},
                {
                    "$set": {
                        "status": InterestStatus.REJECTED.value,
                        "updated_at": datetime.now()
                    }
                }
            )
            
            if result.modified_count == 0:
                return {"success": False, "error": "Failed to reject interest"}
            
            return {"success": True, "message": "Interest rejected"}
        except Exception as e:
            logger.error(f"Error rejecting interest: {str(e)}")
            return {"success": False, "error": str(e)}

    async def get_user_interests(self, email: str) -> dict:
        """Get all interests for a user (sent and received)"""
        try:
            # Get sent interests
            sent_cursor = self.interests_collection.find(
                {"sender_email": email}
            ).sort("created_at", -1)
            sent_interests = await sent_cursor.to_list(length=100)
            
            # Get received interests
            received_cursor = self.interests_collection.find(
                {"receiver_email": email}
            ).sort("created_at", -1)
            received_interests = await received_cursor.to_list(length=100)
            
            # Serialize documents
            sent_interests = [serialize_document(interest) for interest in sent_interests]
            received_interests = [serialize_document(interest) for interest in received_interests]
            
            return {
                "success": True,
                "sent_interests": sent_interests,
                "received_interests": received_interests
            }
        except Exception as e:
            logger.error(f"Error getting user interests: {str(e)}")
            return {"success": False, "error": str(e)}

    # ==================== Report Methods ====================

    async def create_report(self, report_data: dict) -> dict:
        """Create a new report (Available to all users) - One report per user"""
        try:
            reporter_email = report_data.get("reporter_email", "").strip().lower()
            reported_email = report_data.get("reported_email", "").strip().lower()
            
            # Validate required fields
            if not reporter_email or not reported_email:
                return {
                    "success": False, 
                    "error": "Reporter and reported emails are required"
                }
            
            reporter_name = report_data.get("reporter_name", "").strip()
            reported_name = report_data.get("reported_name", "").strip()
            reason = report_data.get("reason", "").strip()
            
            if not reporter_name or not reported_name:
                return {
                    "success": False, 
                    "error": "Reporter and reported names are required"
                }
            
            if not reason:
                return {
                    "success": False, 
                    "error": "Report reason is required"
                }
            
            # Check if trying to report self
            if reporter_email == reported_email:
                return {
                    "success": False,
                    "error": "Cannot report yourself"
                }
            
            # Check if already reported (prevent duplicate reports) - Case insensitive
            existing = await self.reports_collection.find_one({
                "reporter_email": reporter_email,
                "reported_email": reported_email
            })
            
            if existing:
                return {
                    "success": False,
                    "error": "You have already reported this profile. You cannot report the same person multiple times."
                }
            
            # Get profile images
            reporter_profile_img = await self._get_user_profile_img(reporter_email)
            reported_profile_img = await self._get_user_profile_img(reported_email)
            
            # Create report
            report = {
                "reporter_email": reporter_email,
                "reported_email": reported_email,
                "reporter_name": reporter_name,
                "reported_name": reported_name,
                "reason": reason,
                "description": report_data.get("description", "").strip(),
                "reporter_profile_img": reporter_profile_img,
                "reported_profile_img": reported_profile_img,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            result = await self.reports_collection.insert_one(report)
            
            # Get the inserted report to return
            inserted_report = await self.reports_collection.find_one({"_id": result.inserted_id})
            if inserted_report:
                inserted_report = serialize_document(inserted_report)
            
            return {
                "success": True,
                "report_id": str(result.inserted_id),
                "report": inserted_report,
                "message": "Report submitted successfully"
            }
        except Exception as e:
            logger.error(f"Error creating report: {str(e)}")
            return {"success": False, "error": str(e)}

    # ==================== Chat Methods ====================

    async def get_user_conversations(self, email: str) -> dict:
        """Get all conversations for a user (Available to all users with accepted interests)"""
        try:
            cursor = self.conversations_collection.find(
                {"participants.email": email}
            ).sort("updated_at", -1)
            conversations = await cursor.to_list(length=100)
            
            # Process each conversation
            result_conversations = []
            for conv in conversations:
                conv = serialize_document(conv)
                
                # Get last message
                last_message = await self.messages_collection.find_one(
                    {"conversation_id": str(conv["_id"])},
                    sort=[("created_at", -1)]
                )
                if last_message:
                    last_message = serialize_document(last_message)
                    conv["last_message"] = last_message
                
                # Get unread count for this user
                conv["unread_count"] = conv.get("unread_count", {}).get(email, 0)
                
                result_conversations.append(conv)
            
            return {"success": True, "conversations": result_conversations}
        except Exception as e:
            logger.error(f"Error getting user conversations: {str(e)}")
            return {"success": False, "error": str(e)}

    async def send_message(self, message_data: dict) -> dict:
        """Send a new message (Available to all users with accepted interests)"""
        try:
            sender_email = message_data.get("sender_email")
            conversation_id = message_data.get("conversation_id")
            content = message_data.get("content")
            
            # Validate required fields
            if not sender_email or not conversation_id or not content:
                return {"success": False, "error": "Missing required fields"}
            
            # Verify conversation exists and user is participant
            conversation = await self.conversations_collection.find_one({
                "_id": ObjectId(conversation_id),
                "participants.email": sender_email
            })
            
            if not conversation:
                return {"success": False, "error": "Conversation not found or access denied"}
            
            # Create message
            message = {
                "conversation_id": conversation_id,
                "sender_email": sender_email,
                "content": content,
                "read": False,
                "created_at": datetime.now()
            }
            
            result = await self.messages_collection.insert_one(message)
            
            # Update conversation
            if conversation:
                # Increment unread count for other participants
                unread_count = conversation.get("unread_count", {})
                for participant in conversation["participants"]:
                    if participant["email"] != sender_email:
                        unread_count[participant["email"]] = unread_count.get(participant["email"], 0) + 1
                
                await self.conversations_collection.update_one(
                    {"_id": ObjectId(conversation_id)},
                    {
                        "$set": {
                            "updated_at": datetime.now(),
                            "unread_count": unread_count,
                            "last_message": {
                                "content": content,
                                "sender_email": sender_email,
                                "created_at": datetime.now().isoformat()
                            }
                        }
                    }
                )
            
            message_response = {
                "_id": str(result.inserted_id),
                "conversation_id": conversation_id,
                "sender_email": sender_email,
                "content": content,
                "read": False,
                "created_at": datetime.now().isoformat()
            }
            
            return {
                "success": True,
                "message_id": str(result.inserted_id),
                "message": message_response
            }
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return {"success": False, "error": str(e)}

    async def get_conversation_messages(self, conversation_id: str, user_email: str) -> dict:
        """Get all messages in a conversation and mark them as read"""
        try:
            # Verify conversation access
            conversation = await self.conversations_collection.find_one({
                "_id": ObjectId(conversation_id),
                "participants.email": user_email
            })
            
            if not conversation:
                return {"success": False, "error": "Conversation not found or access denied"}
            
            # Mark messages as read
            await self.messages_collection.update_many(
                {
                    "conversation_id": conversation_id,
                    "sender_email": {"$ne": user_email},
                    "read": False
                },
                {
                    "$set": {
                        "read": True,
                        "read_at": datetime.now()
                    }
                }
            )
            
            # Reset unread count for this user
            await self.conversations_collection.update_one(
                {"_id": ObjectId(conversation_id)},
                {"$set": {f"unread_count.{user_email}": 0}}
            )
            
            # Get messages
            cursor = self.messages_collection.find(
                {"conversation_id": conversation_id}
            ).sort("created_at", 1)
            messages = await cursor.to_list(length=1000)
            
            # Serialize messages
            messages = [serialize_document(msg) for msg in messages]
            
            return {"success": True, "messages": messages}
        except Exception as e:
            logger.error(f"Error getting messages: {str(e)}")
            return {"success": False, "error": str(e)}

    async def clear_conversation(self, conversation_id: str, user_email: str) -> dict:
        """Clear all messages in a conversation but keep the conversation (Available to all users)"""
        try:
            # Verify conversation access
            conversation = await self.conversations_collection.find_one({
                "_id": ObjectId(conversation_id),
                "participants.email": user_email
            })
            
            if not conversation:
                return {"success": False, "error": "Conversation not found or access denied"}
            
            # Delete all messages in the conversation
            result = await self.messages_collection.delete_many(
                {"conversation_id": conversation_id}
            )
            
            # Update conversation - reset last_message and unread counts
            await self.conversations_collection.update_one(
                {"_id": ObjectId(conversation_id)},
                {
                    "$set": {
                        "last_message": None,
                        "unread_count": {
                            conversation["participants"][0]["email"]: 0,
                            conversation["participants"][1]["email"]: 0
                        },
                        "updated_at": datetime.now()
                    }
                }
            )
            
            return {
                "success": True,
                "message": f"Cleared {result.deleted_count} messages from conversation",
                "cleared_count": result.deleted_count
            }
        except Exception as e:
            logger.error(f"Error clearing conversation: {str(e)}")
            return {"success": False, "error": str(e)}

    async def export_conversation(self, conversation_id: str, user_email: str) -> dict:
        """Export conversation as text"""
        try:
            # Get conversation
            conversation = await self.conversations_collection.find_one({
                "_id": ObjectId(conversation_id),
                "participants.email": user_email
            })
            
            if not conversation:
                return {"success": False, "error": "Conversation not found or access denied"}
            
            # Get all messages
            cursor = self.messages_collection.find(
                {"conversation_id": conversation_id}
            ).sort("created_at", 1)
            messages = await cursor.to_list(length=1000)
            
            # Generate export text
            other_participant = next(
                p for p in conversation["participants"] if p["email"] != user_email
            )
            
            export_lines = [
                f"Chat Export - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                f"Chat with: {other_participant['name']} ({other_participant['email']})",
                "-" * 50,
                ""
            ]
            
            for msg in messages:
                sender = "You" if msg["sender_email"] == user_email else other_participant["name"]
                time_str = msg["created_at"].strftime("%Y-%m-%d %H:%M:%S") if isinstance(msg["created_at"], datetime) else msg["created_at"]
                export_lines.append(f"[{time_str}] {sender}: {msg['content']}")
            
            export_text = "\n".join(export_lines)
            
            return {"success": True, "content": export_text}
        except Exception as e:
            logger.error(f"Error exporting conversation: {str(e)}")
            return {"success": False, "error": str(e)}

    # ==================== Combined Activity Methods ====================

    async def get_user_activity(self, email: str) -> dict:
        """Get all activity for a user (interests and reports)"""
        try:
            # Get interests
            interests_result = await self.get_user_interests(email)
                        
            return {
                "success": True,
                "sent_interests": interests_result.get("sent_interests", []),
                "received_interests": interests_result.get("received_interests", []),
            }
        except Exception as e:
            logger.error(f"Error getting user activity: {str(e)}")
            return {"success": False, "error": str(e)}