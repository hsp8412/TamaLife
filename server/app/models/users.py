from app import mongo

class UserModel:
    @staticmethod
    def insert_user(name, age):
        return mongo.db.users.insert_one({"name": name, "age": age})

    @staticmethod
    def get_users():
        return list(mongo.db.users.find({}, {"_id": 0}))  # Exclude `_id`