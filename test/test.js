let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
const mongoose = require('mongoose');
let expect = chai.expect;

chai.use(chaiHttp);

describe('Test suit 1', async function () {

    //connects to the Test database

    before(function (done) {

        mongoose.connect('mongodb://localhost/hospital-test', { useNewUrlParser: true });
        mongoose.connection
            .once("open", () => {
                done();
            })
            .on("error", err => {
                console.log("Can't connect to test db: ", err);
            })

    });

    //Delete all the entries from the Doctors
    before((done) => {
        mongoose.connection.collections.doctors.deleteMany({}, (err) => {
            console.log('doctors dropped');
        })
        mongoose.connection.collections.reports.deleteMany({}, (err) => {
            console.log('reports dropped');
        })
        mongoose.connection.collections.patients.deleteMany({}, (err) => {
            console.log('patients dropped');
        })
        done();
    })

   

    //test cases

    let token;
    let patient_id;
    let unregistered_patient_id = 00000000;

    //.............DOCTORS..................

    describe('Register a doctor', async () => {

        var doctor = {
            "name": "John Doe",
            "email": "johndoe@abc.com",
            "username": "john_doe",
            "password": "1234"
        }

        //register successfully

        it('should register a doctor if username and email id is not already registered', function (done) {
            chai.request(server)
                .post('/hospital/api/doctor/register')
                .send(doctor)
                .end(function (err, res) {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property("data");
                    expect(res.body.message).to.equal("User registered");
                    expect(res.body.data.name).to.equal(doctor.name);
                    expect(res.body.data.email).to.equal(doctor.email);
                    expect(res.body.data.username).to.equal(doctor.username);
                    done();

                });


        });



        //doctor already exists

        await it('should not register a doctor if username and email id is already registered', function (done) {
            chai.request(server)
                .post('/hospital/api/doctor/register')
                .send(doctor)
                .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.body.status).to.equal("Failure");
                    expect(res.body.message).to.be.oneOf(["Username already exists", "Email already exists"]);
                    done();

                });


        });

    });

    //Login a doctor

    await describe('Login a doctor', () => {

        //doctor is not registered
        var input1 = {
            "username": "john_doe_new",
            "password": "1234"
        }

        //username that already exists
        var input2 = {
            "username": "john_doe",
            "password": "123456"
        }

        //correct credentials
        var input3 = {
            "username": "john_doe",
            "password": "1234"
        }


        //if doctor is not registered
        it('should not login a doctor if doctor is not registered (username not found in DB)', function (done) {
            chai.request(server)
                .post('/hospital/api/doctor/login')
                .send(input1)
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    expect(res.body.status).to.equal("Failure");
                    expect(res.body.message).to.equal("Incorrect username or password");
                    done();

                });


        });

        //if doctor tries to log in using incorrect credentials (username/password)
        it('should not login a doctor if password is incorrect', function (done) {
            chai.request(server)
                .post('/hospital/api/doctor/login')
                .send(input2)
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    expect(res.body.status).to.equal("Failure");
                    expect(res.body.message).to.equal("Incorrect username or password");
                    done();

                });


        });

        //if doctor is registered and all credentials are correct
        it('login a doctor if he is registered and the credentials are correct', function (done) {
            chai.request(server)
                .post('/hospital/api/doctor/login')
                .send(input3)
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.equal("Success");
                    expect(res.body).to.have.property("JWT_token");
                    token = res.body.JWT_token;
                    done();

                });


        });


    });


    //.........PATIENTS............

    await describe('Register a patient', async () => {

        let patient = {
            "name": "Jane Doe",
            "phone": "12345678"
        }

        //register successfully and display data of patient

        it('register successfully and display data of patient', function (done) {
            chai.request(server)
                .post('/hospital/api/patient/register')
                .set("authorization", "Bearer " + token)
                .send(patient)
                .end(function (err, res) {
                    expect(res).to.have.status(201);
                    expect(res.body.status).to.equal("Success");
                    expect(res.body.message).to.equal("Patient registered");
                    expect(res.body).to.have.property("data");
                    expect(res.body.data).to.have.property("id");
                    expect(res.body.data.name).to.equal(patient.name);
                    expect(res.body.data.phone).to.equal(patient.phone);
                    patient_id = patient.phone;
                    done();

                });

        });

        //display data of patient if already registered

        await it('display data of patient if already registered', function (done) {
            chai.request(server)
                .post('/hospital/api/patient/register')
                .set("authorization", "Bearer " + token)
                .send(patient)
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.equal("Success");
                    expect(res.body.message).to.equal("Patient exists");
                    expect(res.body).to.have.property("data");
                    expect(res.body.data.name).to.equal(patient.name);
                    expect(res.body.data.phone).to.equal(patient.phone);
                    expect(res.body.data.createdBy).to.equal("John Doe");
                    done();


                });


        });

        //Error message if doctor is not authorized
        it('unauthorized: cannot register patient', function (done) {
            chai.request(server)
                .post('/hospital/api/patient/register')
                .send(patient)
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    done();

                });

        });

    });


    //..........REPORTS................

    await describe('Create reports', async () => {

        let status1 = {
            "status": 1
        }

        let status2 = {
            "status": 2
        }

        let statusInvalid = {
            "status": 100
        }

        //doctor not authorized

        it('unauthorized: cannot create report', function (done) {
            chai.request(server)
                .post('/hospital/api/patient/' + patient_id + '/create_report')
                .send(status1)
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    done();

                });

        });

        //patient not registered
        it('patient not registered', function (done) {
            chai.request(server)
                .post('/hospital/api/patient/' + unregistered_patient_id + '/create_report')
                .set("authorization", "Bearer " + token)
                .send(status1)
                .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.body.status).to.equal("Failure");
                    expect(res.body.message).to.equal("Patient not registered");
                    done();

                });

        });


        //status code is invalid
        it('status code invalid', function (done) {
            chai.request(server)
                .post('/hospital/api/patient/' + patient_id + '/create_report')
                .set("authorization", "Bearer " + token)
                .send(statusInvalid)
                .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.body.status).to.equal("Failure");
                    expect(res.body.message).to.equal("Invalid status code");
                    done();

                });

        });


        //create report if doctor is authorized, patient is registered and status code is valid

        it('report created successfully', function (done) {
            chai.request(server)
                .post('/hospital/api/patient/' + patient_id + '/create_report')
                .set("authorization", "Bearer " + token)
                .send(status1)
                .end(function (err, res) {
                    expect(res).to.have.status(201);
                    expect(res.body.status).to.equal("Success");
                    expect(res.body.message).to.equal("New report created");
                    done();

                });

        });


    });


    await describe('Get reports', async () => {

        //if doctor is unauthorized

        it('unauthorized: cannot get reports', function (done) {
            chai.request(server)
                .get('/hospital/api/patient/' + patient_id + '/all_reports')
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    done();

                });

        });

        //patient doesn't exist

        it('patient not registered', function (done) {
            chai.request(server)
                .get('/hospital/api/patient/' + unregistered_patient_id + '/all_reports')
                .set("authorization", "Bearer " + token)
                .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.body.status).to.equal("Failure");
                    expect(res.body.message).to.equal("Patient not registered");
                    done();

                });

        });


        //get reports if doctor is authorized and if patient exists

        it('get reports successfully', function (done) {
            chai.request(server)
                .get('/hospital/api/patient/' + patient_id + '/all_reports')
                .set("authorization", "Bearer " + token)
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.message).to.equal("All Reports");
                    expect(res.body).to.have.property("data");
                    expect(res.body.data.patient.name).to.equal("Jane Doe");
                    expect(res.body.data.patient.phone).to.equal("12345678");
                    expect(res.body.data.reports[0].status).to.equal("Travelled - Quarantine");
                    expect(res.body.data.reports[0].createdBy.name).to.equal("John Doe");
                    expect(res.body.data.reports[0]).to.have.property("createdAt");
                    done();

                });

        });

    });



    // ..........FILTER REPORTS............

    await describe('Get reports', async () => {

       
        //create 2nd report
        it('2nd report created successfully', function (done) {
            chai.request(server)
                .post('/hospital/api/patient/'+patient_id+'/create_report')
                .set("authorization", "Bearer "+token)
                .send({status: 1})
                .end(function (err, res) {
                    expect(res).to.have.status(201);
                    expect(res.body.status).to.equal("Success");
                    expect(res.body.message).to.equal("New report created");
                    done();

                });

        });

        //create 3rd report
        it('2nd report created successfully', function (done) {
            chai.request(server)
                .post('/hospital/api/patient/'+patient_id+'/create_report')
                .set("authorization", "Bearer "+token)
                .send({status: 2})
                .end(function (err, res) {
                    expect(res).to.have.status(201);
                    expect(res.body.status).to.equal("Success");
                    expect(res.body.message).to.equal("New report created");
                    done();

                });

        });


        //invalid status code

        it('filter reports with invalid status code', function (done) {
            chai.request(server)
                .get('/hospital/api/reports/100')
                .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.body.status).to.equal("Failure");
                    expect(res.body.message).to.equal("Invalid status code");
                    done();

                });

        });


        //get all reports if status code is valid

        it('filter reports with valid status code', function (done) {
            chai.request(server)
                .get('/hospital/api/reports/1')
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.equal("Success");
                    expect(res.body.report_status).to.equal("Travelled - Quarantine");
                    expect(res.body).to.have.property("data");
                    expect(res.body.data[0].createdBy.name).to.equal("John Doe");
                    expect(res.body.data[0].patient.name).to.equal("Jane Doe");
                    expect(res.body.data[0].patient.phone).to.equal("12345678");
                    expect(res.body.data[0]).to.have.property("createdAt");
                    expect(res.body.data[1].createdBy.name).to.equal("John Doe");
                    expect(res.body.data[1].patient.name).to.equal("Jane Doe");
                    expect(res.body.data[1].patient.phone).to.equal("12345678");
                    expect(res.body.data[1]).to.have.property("createdAt");
                    done();


                });

        });

    });

});






