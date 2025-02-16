from app import mongo

class UserModel:
    @staticmethod
    def insert_user(first_name, last_name, email, password, pet_name):
        return mongo.db.users.insert_one({"first_name": first_name, "last_name": last_name, "email": email, "password": password, "pet_name": pet_name})
    

    @staticmethod
    def get_users():
        return list(mongo.db.users.find({}, {"_id": 0}))  # Exclude `_id`
    
    @staticmethod
    def get_user(email):
        return mongo.db.users.find_one({"email": email}, {"_id": 0})
    