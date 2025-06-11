// *************** IMPORT MODULE *************** 
const School =  require('./school.models.js');
const Student = require('../student/student.models.js')


// *************** Get All School
async function GetAllSchool(){
  return await School.find({ status:"active" })
}
// *************** Get School By Id
async function GetSchoolById(_,{id}) {
  const school = await School.findById(id)
    if(!school){
      throw new Error("School not found")
    }
    return school;
}

// *************** Create School
async function CreateSchool(_,{schoolInput}){
const schoolTaken = await School.findOne({ name: schoolInput.name });
if (schoolTaken) {
  throw new Error("School name already exists");
}

  const createdSchool = await School.create(schoolInput);
  console.log("School has created", createdSchool);
  return createdSchool;
}

// *************** Update School
async function UpdateSchool(_,{id,schoolInput}){
  if (schoolInput.id){
    throw new Error("Cannot update School ID");
  }

  const updatedSchool = await School.findByIdAndUpdate(id, schoolInput, { new:true });

  if(!updatedSchool){
    throw new Error("School not Found");
  }
  return updatedSchool;
}

// *************** Delete School
async function DeleteSchool(_,{id}){
  const deleteUser = await School.findByIdAndUpdate(
    id,
    {
      status:"deleted",
      deleted_at: new Date()
    },
    {new: true}
  );
  if (!deleteUser){
    throw new Error("School not found")
  }
  return deleteUser
}

// *************** Get Student Data
async function GetStudentData(parent,_,{loaders}){
    if (!parent.student || parent.student.length ===0){
        return [];
      }
    const studentId = parent.student.map(id => id.toString());
    const result = await loaders.student.loadMany(studentId);
    return result.filter(student => student !==null)
}

const schoolResolvers = {
  Query: {
    GetAllSchool,
    GetSchoolById
  },
  Mutation:{
    CreateSchool,
    UpdateSchool,
    DeleteSchool
  },
  School:{
    students: GetStudentData
  }
};

// *************** EXPORT MODULE ***************
module.exports = { schoolResolvers };