const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin@123',
    port: 3306
})
db.connect((err) => {
    if (err) {
        console.log(err);
    }
    console.log('Connected to database');
})

db.query(`CREATE DATABASE IF NOT EXISTS GPSAttendenceSystem;`, (err, result) => {
    if (err) throw err;
})
db.query('USE GPSAttendenceSystem;', (err, result) => {
    if (err) throw err;
});
db.query(`
    CREATE TABLE IF NOT EXISTS StaffDetails (
    StaffId INT AUTO_INCREMENT PRIMARY KEY,
    AdminName VARCHAR(30) NOT NULL UNIQUE,
    AdminPass VARCHAR(30) NOT NULL UNIQUE
)`, (err, result) => {
    if (err) throw err;
})
db.query(`
    Create table IF NOT EXISTS StudentDetails(
	Enrollment BIGINT(10) AUTO_INCREMENT PRIMARY KEY,
    StudentName VARCHAR(50) NOT NULL,
    StudentRoll INT NOT NULL,
    Branch char(2) NOT NULL,
    sem int NOT NULL
);`, (err, result) => {
    if (err) throw err;
})
db.query(`
    CREATE TABLE IF NOT EXISTS ATTENDANCE (
	Enrollment BIGINT(10) NOT NULL,
    AttendDate DATE,
    AttendanceStatus VARCHAR(8),
    Subject varchar(100),
    FOREIGN KEY (Enrollment) REFERENCES StudentDetails(Enrollment)
);
`, (err, result) => {
    if (err) throw err;
})

const app = express();
const port = 3000 || process.env.PORT;

// app.use(express.static());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/admin.html')
})
app.post('/attendance', (req, res) => {
    const AdminData = req.body;
    db.query('SELECT AdminName, AdminPass FROM StaffDetails', (err, result, fields) => {
        if (err) throw err;
        if (result[0].AdminName == AdminData.adminName && result[0].AdminPass == AdminData.adminPass) {
            res.sendFile(__dirname + '/attendance.html')
        }
        else {
            res.send("Login Failed")
        }
    })
})
app.post('/student-details', (req, res) => {
    const SData = req.body;
    console.log(SData);
    const sqlQ = `SELECT * FROM StudentDetails WHERE branch=? and sem=? ORDER BY StudentRoll ASC`
    db.query(sqlQ, [SData.StBranch, SData.StSem], (err, result) => {
        if (err) throw err;
        res.send(result)
    })
})

app.post('/markAttendance', (req, res) => {
    const AData = req.body;
    const sqlQ = 'INSERT INTO ATTENDANCE (Enrollment, AttendDate, AttendanceStatus, Subject) VALUES (?, ?, ?, ?)'
    db.query(sqlQ, [AData.mark, AData.aDate, AData.status, AData.aSubject], (err, result) => {
        if (err) throw err;
        console.log(result)
        res.send(AData)
    })
})
app.post('/add-student', (req, res) => {
    const NewStudent = req.body;
    db.query('INSERT INTO StudentDetails (Enrollment, StudentName, StudentRoll, Branch, sem) VALUES (?, ?, ?, ?, ?);', [NewStudent.Senroll, NewStudent.Sname, NewStudent.Sroll, NewStudent.Sbranch, NewStudent.Ssem], (err, result) => {
        if (err) throw err;
        res.send({ status: 200, msg: "Successfully added student into database (" + NewStudent.Sname + ")" })
    })
})
app.listen(port, 'localhost', () => {
    console.log('Application is running on port : ' + port);
})