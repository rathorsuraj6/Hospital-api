const Patient = require('../models/patient_model');
const Report = require('../models/report_model');

//List of available status
//Every status is assigned a number (status code) corresponding to the index of the following array
//For example, status code '0' corresponds to 'Negative status, status code '1' corresponds to 'Travelled - Quarantine', and so on
const statusCodeList = ["Negative", "Travelled - Quarantine", "Symptoms - Quarantine", "Positive - Admit"];

//Register a new patient
//This is a protected route,i.e., only a logged in doctor can register a new patient

module.exports.register = async function (req, res) {

    try {

        //check if the patient already exists using the phone number

        const patient = await Patient.findOne({ phone: req.body.phone });

        //if the patient already exists, return the data of the patient
        if (patient) {
            return res.status(200).json({
                status: 'Success',
                message: 'Patient exists',
                data: {
                    id: patient._id,
                    name: patient.name,
                    phone: patient.phone,
                    createdBy: req.user.name
                }
            })
        };

        //if the patient doesn't exist, register the patient
        const newPatient = await Patient.create({
            phone: req.body.phone,
            name: req.body.name,
            createdBy: req.user //Store the logged in doctor who registered the patient
        });

        //Return information of the newly registered patient
        return res.status(201).json({
            status: 'Success',
            message: 'Patient registered',
            data: {
                id: newPatient._id,
                name: newPatient.name,
                phone: newPatient.phone,
                createdBy: req.user.name
            }
        });

    } catch (err) {
        res.status(500).json({ 'message': 'Internal server error', err });
    }
}

//create a report for a patient
//This is a protected route,i.e., only a logged in doctor can perform this task

module.exports.createReport = async function (req, res) {

    try {

        //use patient's id to check if patient is registered

        const patient = await Patient.findOne({ 'phone': req.params.id });

        if (!patient) {
            return res.status(400).json({
                status: 'Failure',
                message: 'Patient not registered'
            })
        };

        //if patient is registered, check if status code is valid
        var s = req.body.status;

        if(!(s==0||s==1||s==2||s==3)){
            return res.status(400).json({
                status: 'Failure',
                message: 'Invalid status code'
            })
        }

        //if patient is registered and status code is valid, create report
        const report = await Report.create({
            statusCode: req.body.status,
            status: statusCodeList[req.body.status],
            createdBy: req.user._id, //stores the Doctor object
            patient: patient._id    //stores the Patient object

        });

        await Patient.updateOne({ 'phone': req.params.id }, {
            //Add the id of the report to the corresponding Patient document
            $push: {
                reports: report._id
            }
        });

        return res.status(201).json({
            status: 'Success',
            message: 'New report created'
        })

    } catch (err) {
        return res.status(500).json({ 'message': 'Internal server error', err });
    }


};

//get all the reports of a patient
//this route is unprotected, i.e, it can be accessed by anyone without authentication

module.exports.allReports = async function (req, res) {

    try {


        //use patient's phone to check if patient is registered
        const patient = await Patient.findOne({ 'phone': req.params.id }, "name phone");

        if (!patient) {
            return res.status(400).json({
                status: 'Failure',
                message: 'Patient not registered'
            })
        };

        //fetch all the reports of a patient, sort the reports chronologically and populate the doctor object
        let reports = await Report.find({ 'patient': patient._id }, "status createdAt createdBy -_id")
            .sort('createdAt')
            .populate('createdBy', "name -_id");


        return res.status(200).json({
            message: "All Reports",
            data: {
                patient: patient,
                reports: reports
            }
        })


    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', err });
    }


};