import os
from flask import Flask, jsonify, request
from models import db
from models import User, Room, Content
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, join_room, leave_room

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    password = data['password']
    user = User.query.filter_by(username=username).first()
    if user:
        res = { "message": "err", "errmsg": "exist nickname" }
        return res
    else:
        usertable = User() # user_table 클래스
        usertable.username = username
        usertable.password = password

        db.session.add(usertable)
        db.session.commit()
        
        res = { "message": "success" }
        return res

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    user = User.query.filter_by(username=username).first()
    if not user:
        res = { "message": "err", "errmsg": "닉네임이 존재하지 않습니다." }
        return res
    else:
        if user.password != password:
            res = { "message": "err", "errmsg": "비밀번호가 일치하지 않습니다." }
            return res
        else:
            res = {
                "message": "success",
                "data": {
                    "id": user.id,
                    "username": user.username
                }
            }
        return jsonify(res)

@app.route('/api/rooms/<userid>')
def room(userid):
    user = User.query.filter_by(id=int(userid)).first()
    res = []
    for x in user.rooms:
        temp = {
            "room_id": x.id,
            "member_num": len(x.users),
        }
        res.append(temp)
    return jsonify(res)


@socketio.on('make')
def makeRoom(data):
    userid = data["user_id"]
    user = User.query.filter_by(id=userid).first()
    roomtable = Room()
    user.rooms.append(roomtable)
    db.session.add(user)
    db.session.add(roomtable)
    db.session.commit()
    socketio.emit('make', "ok")

@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)
    # socketio.emit("response", room, to=room)

@socketio.on('enter', namespace='/chat')
def enter(data):
    room = int(data['room'])
    user_id = int(data['user_id'])
    user = User.query.filter_by(id=user_id).first()
    roomdata = Room.query.filter_by(id=room).first()
    contents = Content.query.filter_by(room_id=room).all()
    allcontent = []
    for x in contents:
        user_id = User.query.filter_by(id=x.user_id).first().username
        temp = {
            "chat_id": x.id,
            "content": x.content,
            "writer": user_id,
            "time": str(x.create_at)
        }
        allcontent.append(temp)
    usernames = []
    for x in roomdata.users:
        usernames.append(x.username)
    room_info = {"room_id": room, "member_num": len(roomdata.users), "member": usernames}
    data = {"room": room_info, "content": allcontent}
    join_room(room)
    if user in roomdata.users:
        socketio.emit('enter res', data, namespace='/chat', to=room)
    else:
        socketio.emit('enter res', "no", namespace='/chat', to=room)  

@socketio.on('leave')
def on_leave():
    rooms = Room.query.all()
    for room in rooms:
        leave_room(room.id)
    socketio.send("bye", to=room)

@socketio.on('my event', namespace='/chat') 
def handleMessage(msg):
    chat = {
        "chat_id": -1,
        "content": msg["content"],
        "writer": msg["username"],
    }
    room = msg['room']
    socketio.emit("response", chat, namespace='/chat', to=room)
    contenttable = Content()
    contenttable.content = msg["content"]
    contenttable.user_id = msg["writer"]
    contenttable.room_id = msg["room"]
    db.session.add(contenttable)
    db.session.commit()

@socketio.on('search friend', namespace='/chat')
def search(data):
    username = data["friend"]
    room_id = data["room_id"]
    user = User.query.filter_by(username=username).first()
    room = Room.query.filter_by(id=room_id).first()
    if not user:
        socketio.emit("find", "no", namespace='/chat', to=room_id)
    elif room in user.rooms:
        socketio.emit("find", "exist", namespace='/chat', to=room_id)
    else:
        user.rooms.append(room)
        db.session.add(user)
        db.session.commit()
        socketio.emit("find", "yes", namespace='/chat', to=room_id)
        usernames = []
        for x in room.users:
            usernames.append(x.username)
        socketio.emit(
            "plus member", 
            {"room_id": room_id, "member_num": len(room.users), "member": usernames}, 
            namespace='/chat', 
            to=room_id
        )

@socketio.on('exit', namespace='/chat')
def exit(data):
    username = data['user']
    room_id = data['room']
    room = Room.query.filter_by(id=room_id).first()
    user = User.query.filter_by(username=username).first()    
    room.users.remove(user)
    socketio.emit("go away", "success", namespace='/chat')
    if len(room.users) == 0:
        db.session.delete(room)
        db.session.commit()    


# 현재있는 파일의 디렉토리 절대경로
basdir = os.path.abspath(os.path.dirname(__file__))
# basdir 경로안에 DB파일 만들기
dbfile = os.path.join(basdir, 'db.sqlite')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + dbfile
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True  # 비지니스 로직이 끝날때 Commit 실행(DB반영)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 수정사항에 대한 TRACK
app.config['SECRET_KEY'] = os.urandom(12)  # SECRET_KEY

db.init_app(app)
db.app = app
db.create_all()

if __name__ == '__main__':     
    socketio.run(app) 
    app.run(host='10.10.1.83', port=5000)  