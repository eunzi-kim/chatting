from flask import Flask
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
db = SQLAlchemy()
migrate = Migrate(app, db)

association_table = db.Table('association', db.Model.metadata,
    db.Column('user', db.Integer, db.ForeignKey('user.id')),
    db.Column('room', db.Integer, db.ForeignKey('room.id'))
)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(15), unique=True, nullable=False)
    password = db.Column(db.String(20), nullable=False)
    rooms = db.relationship("Room",
                secondary=association_table,
                back_populates="users")
    contents = db.relationship("Content", backref="user")

class Room(db.Model):
    __tablename__ = 'room'
    id = db.Column(db.Integer, primary_key=True)
    users = db.relationship("User",
                secondary=association_table,
                back_populates="rooms")
    contents = db.relationship("Content",backref="room")
   
class Content(db.Model):
    __tablename__ = 'content'
    id = db.Column(db.Integer, primary_key=True)
    content= db.Column(db.Text, nullable=False)
    create_at = db.Column(db.DateTime, default=datetime.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'))