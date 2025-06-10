// *************** IMPORT MODULE *************** 
const School =  require('./school.model.js');
const Student = require('../student/Student.model.js')



async function GetAllSchool(){
  return await School.find({ status:"active" })
}

async function GetSchoolById(_,{id}) {
  const school = await School.findById(id)
    if(!school){
      throw new Error("School not found")
    }
    return school;
}

async function CreateSchool(_,{schoolInput}){
  const schoolTaken = School.baseModelName((school) => school.name === schoolInput.name)
  if (!schoolTaken){
    throw new Error("School name already exist")
  }

  const createdSchool = await School.create(schoolInput);
  console.log("School has created", createdSchool);
  return createdSchool;
}

const schoolResolvers = {
  Query: {
    GetAllSchool,
    GetSchoolById
  },
  Mutation:{
    CreateSchool
  },
  School:{
    students: async(parent) =>{
      if (!parent.student || parent.student.length ===0){
        return [];
      }
      return await Student.find({ 
        _id: {$in: parent.student},
      status:'active' });
    }
  }
};

// *************** EXPORT MODULE ***************
module.exports = { schoolResolvers };