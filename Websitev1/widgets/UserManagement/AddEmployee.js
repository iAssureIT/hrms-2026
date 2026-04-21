import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faGlobe,
  faUserShield,
  faUser,
  faThumbsUp,
  faUsers,
  faCalendarDay,
  faClipboardUser,
  faApartment,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
// import { Card } from '@material-tailwind/react';
// import StatBox from '../../components/StatBox/StatBox';
import axios from "axios";
import { useForm } from "react-hook-form";
import swal from "sweetalert2";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// import { Formik } from 'formik';

const schema = yup
  .object()
  .shape({
    first_name: yup.string().required("This field is required"),
    last_name: yup.string().required("This field is required"),
    phone: yup.string().required("This field is required"),
    email: yup.string().email().required("This field is required"),
    role: yup
      .mixed()
      .transform((v) => (!v ? undefined : v))
      .required("This field is required"),
    // department: yup.string().required('This field is required'),
    // designation: yup.string().required('This field is required'),
    // reporting_manager: yup.string()
  })
  .required();

function AddEmployee(props) {
  const [open, setOpen] = useState(true);
  const [user, setUser] = useState();
  const [roleList, setRoleList] = useState([]);
  // const [departmentList,setDepartmentList] = useState([]);
  // const [designationList,setDesignationList] = useState([]);
  // const [managerList,setManagerList] = useState([]);
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  // const [department,setDepartment]= useState('');
  // const [designation,setDesignation]= useState('');
  // const [reporting_manager,setReportingManager]= useState('');
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    clearErrors,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    var user = JSON.parse(localStorage.getItem("userDetails"));
    setUser(user);
    getRoleList();
    // getDepartmentList();
    // getManagerList();
    if (props.editUserId && props.edit) {
      getOneUser(props.editUserId);
    }
  }, [1]);

  const getOneUser = (user_id) => [
    axios
      .get("/api/users/get/" + user_id)
      .then((res) => {
        setFirstName(res.data.firstname);
        setLastName(res.data.lastname);
        setPhone(res.data.mobile);
        var roleNew = res.data.role.toString();
        setRole(roleNew);
        setEmail(res.data.email);
        // setDepartment(res.data.department);
        // getDesignationList(res.data.department);
        // setDesignation(res.data.designation+"-"+res.data.orgLevel);
        // setReportingManager(res.data.reporting_id._id);
        reset(res.data);
      })
      .catch((err) => {
        console.log("err", err);
      }),
  ];

  // const getManagerList =()=>[
  //     axios.get('/api/users/get/managerlist/manager')
  //     .then(res=>{
  //         console.log("res",res);
  //         var userList = [];
  //         for (let index = 0; index < res.data.data.length; index++) {
  //             let userData ={
  //                 _id  : res.data.data[index]._id,
  //                 name : res.data.data[index]?.profile?.fullName,
  //                 username : res.data.data[index]?.username
  //             }
  //             userList.push(userData);
  //         }
  //         setManagerList(userList);
  //     })
  //     .catch(err=>{
  //         console.log("err",err);
  //     })
  // ]

  const getRoleList = () => {
    axios
      .post("/api/roles/get/list")
      .then((response) => {
        var roleList = [];
        for (let index = 0; index < response.data.length; index++) {
          let roleData = {
            role_id: response.data[index]._id,
            role: response.data[index].role,
          };
          roleList.push(roleData);
        }
        setRoleList(roleList);
      })
      .catch((err) => console.log("err", err));
  };

  // const getDepartmentList =()=>{
  //     axios.post('/api/department/get/list')
  //     .then((response) => {
  //      console.log("response role",response);
  //      var departmentList = [];
  //      for (let index = 0; index < response.data.length; index++) {
  //          let data ={
  //             department_id : response.data[index]._id,
  //             department:response.data[index].department
  //          }
  //          departmentList.push(data);
  //      }
  //      setDepartmentList(departmentList)
  //      console.log("roleList",roleList);
  //     })
  //     .catch((err)=>console.log("err",err))
  // }

  // const getDesignationList =(value)=>{
  //     console.log("value==>",value);
  //     setDepartment(value);
  //     axios.post('/api/designation/get/list/',{department:value})
  //     .then((response) => {
  //      console.log("response role",response);
  //      var designationList = [];
  //      for (let index = 0; index < response.data.length; index++) {
  //          let data ={
  //             designation_id : response.data[index]._id,
  //             designation:response.data[index].designation,
  //             orgLevel:response.data[index].orgLevel,
  //             department:response.data[index].department
  //          }
  //          designationList.push(data);
  //      }
  //      setDesignationList(designationList)
  //      console.log("roleList",roleList);
  //     })
  //     .catch((err)=>console.log("err",err))
  // }

  const submitForm = (data) => {
    const formValues = {
      firstname: data.first_name,
      lastname: data.last_name,
      email: data.email,
      username: "EMAIL",
      userName: data.email,
      mobNumber: data.phone.replace("-", ""),
      // "reporting_id":data.reporting_manager,
      pwd: "iAssureIT@123",
      // // "department" :data.department,
      // // "designation": data?.designation !== ""?data?.designation.split("-")[0] :"",
      // "orgLevel" : data?.designation !== ""?data?.designation.split("-")[1] :"",
      role: [data.role],
      companyID: 1,
      status: "active",
      createdBy: user.user_id,
    };
    //   console.log("formValues",formValues);
    if (props.edit) {
      axios
        .patch("/api/users/patch/profile/" + props.editUserId, formValues)
        .then((res) => {
          // console.log("res",res);
          // addEmployee(formValues);
          swal({
            text: "User updated Sucessfully",
          });
          props.getUserList();
          window.location.reload();
        })
        .catch((err) => console.log("err", err));
    } else {
      axios
        .post("/api/auth/post/signup/user", formValues)
        .then((res) => {
          formValues.userId = res.data.ID;

          addEmployee(formValues);
          swal({
            text: "User added Sucessfully",
          });
          props.getUserList();
          window.location.reload();
        })
        .catch((err) => console.log("err", err));
    }
  };

  const addEmployee = (data) => {
    axios
      .post("/api/personmaster/post", data)
      .then((res) => {
        reset();
      })
      .catch((err) => console.log("err", err));
  };

  const funcRoll = (data) => {
    var roles = [...role];
    var newArray = [...roles, data];
    setRole(data);
  };

  return (
    <div className="w-full  ">
      <div className="p-7 text-xl font-semibold">
        <div className="grid  grid-cols bg-grey-200 mb-8">
          {/* <span className='text-left'>Add Employee</span> */}
          <form onSubmit={handleSubmit(submitForm)}>
            <div className="grid gap-6 mb-6 md:grid-cols-2">
              <div>
                <label
                  for="first_name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  First name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={first_name}
                  {...register("first_name")}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    clearErrors("first_name");
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#3c8dbc] focus:border-[#3c8dbc] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#3c8dbc] dark:focus:border-[#3c8dbc]"
                  placeholder="Enter Firstname..."
                />
                {errors?.first_name && (
                  <span className="text-sm font-medium text-red-500">
                    {errors.first_name.message}
                  </span>
                )}
              </div>
              <div>
                <label
                  for="last_name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Last name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={last_name}
                  {...register("last_name")}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearErrors("last_name");
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#3c8dbc] focus:border-[#3c8dbc] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#3c8dbc] dark:focus:border-[#3c8dbc]"
                  placeholder="Enter Lastname..."
                />
                {errors?.last_name && (
                  <span className="text-sm font-medium text-red-500">
                    {errors.last_name.message}
                  </span>
                )}
              </div>
              <div>
                <label
                  for="phone"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Phone number<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register("phone")}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearErrors("phone");
                  }}
                  value={phone}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#3c8dbc] focus:border-[#3c8dbc] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#3c8dbc] dark:focus:border-[#3c8dbc]"
                  placeholder="Enter Mobile number..."
                  pattern="/^+91(7\d|8\d|9\d)\d{9}$/"
                />
                {errors?.phone && (
                  <span className="text-sm font-medium text-red-500">
                    {errors.phone.message}
                  </span>
                )}
              </div>
              <div>
                <label
                  for="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email address<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  disabled={props.edit}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearErrors("email");
                  }}
                  value={email}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#3c8dbc] focus:border-[#3c8dbc] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#3c8dbc] dark:focus:border-[#3c8dbc]"
                  placeholder="Enter Email..."
                />
                {errors?.email && (
                  <span className="text-sm font-medium text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>
              <div>
                <label
                  for="role"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Select Role<span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  value={role}
                  {...register("role")}
                  onChange={(e) => {
                    setRole(e.target.value);
                    clearErrors("role");
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#3c8dbc] focus:border-[#3c8dbc] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#3c8dbc] dark:focus:border-[#3c8dbc]"
                >
                  <option value="" selected>
                    Select Role
                  </option>
                  {roleList &&
                    roleList.map((item, index) => {
                      return (
                        <option key={index} value={item.role}>
                          {item.role}
                        </option>
                      );
                    })}
                </select>
                {errors?.role && (
                  <span className="text-sm font-medium text-red-500">
                    {errors.role.message}
                  </span>
                )}
              </div>
              {/* <div >
                            <label for="department" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Department<span className="text-red-500">*</span></label>
                            <select id="department"  value={department} {...register("department")} onChange={(e)=>{getDesignationList(e.target.value);clearErrors('department')}}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500" >
                                <option value=""  selected>Select Department</option>
                                {departmentList &&
                                    departmentList.map((item,index)=>{
                                        return(
                                            <option value={item.department}>{item.department}</option>
                                        )
                                    })
                                }
                            </select>
                            {errors?.department && <span className="text-sm font-medium text-red-500">{errors.department.message}</span>}
                        </div> 
                        <div >
                            <label for="designation" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Designation<span className="text-red-500">*</span></label>
                            <select id="designation" value={designation} {...register("designation")} onChange={(e)=>{setDesignation(e.target.value);clearErrors('designation')}}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500">
                                <option value="" selected >Select Designation</option>
                                {designationList &&
                                    designationList.map((item,index)=>{
                                        return(
                                            <option value={item.designation+"-"+item.orgLevel}>{item.designation}</option>
                                        )
                                    })
                                }
                            </select>
                            {errors?.designation && <span className="text-sm font-medium text-red-500">{errors.designation.message}</span>}

                        </div> 
                        <div >
                            <label for="reporting_manager" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Reporting Manager</label>
                            <select id="reporting_manager" value={reporting_manager}  {...register("reporting_manager")} onChange={(e)=>{setReportingManager(e.target.value);clearErrors('reporting_manager')}}   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500">
                                <option value=""   selected>Select Reporting Manager</option>
                                    {managerList  && managerList.length> 0 &&
                                    managerList.map((item,index)=>{
                                        return(
                                            <option value={item?._id}>{item?.name}</option>
                                        )
                                    })
                                }
                            </select>
                            {errors?.reporting_manager && <span className="text-sm font-medium text-red-500">{errors.reporting_manager.message}</span>}
                        </div>  */}
            </div>

            <button
              type="submit"
              className="text-white bg-site hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-[#3c8dbc] dark:hover:bg-[#367fa9] dark:focus:ring-blue-800"
            >
              {props.edit ? "Update" : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;
