const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const debug = require("debug")("test");
// const check = require('../validation/CheckValidation') 
const conn = require('../config/db')
const Users = require("../models/users");
const AppService = require("../services/AppService");

const { uploadFile, deletDiskFile } = require("../utils/utils");
const path = require('path');

const moment = require('moment');
//const {authToken} =require('../middleware/getToken')
//User login 
var nodemailer = require('nodemailer');
const e = require('express');
const adminRole = [0, 1];
const vendorRole = [2, 3, 4, 5];

const reportRole = [2, 3, 4, 5];

const authLogin = async (req, res) => {
    let message = 'Login Not Allowed';
    let statusCode = 400;
    let error = {};
    let data = {};
    let token = '';


    try {
        const { email, password, device_id, type = 'mobile' } = req.body;
        console.log(email, password, device_id,"jwdnndj");
        //let sql = `SELECT * FROM users WHERE LOWER(Users.email) = ?`;
        let usersRows = await Users.findOne({ email: email });

        if (usersRows) {

            const comparison = password == usersRows.password;

            if (comparison) {
                const updateSuccess = await updateDeviceId(email, device_id);

                if (updateSuccess) {
                    const last_login = moment().format('YYYY-MM-DD HH:mm:ss');
                    statusCode = 200;
                    message = 'Login success';
                    data = {
                        id: usersRows._id,
                        distributor_id: 'masterid',
                        user_id: usersRows.email,
                        username: usersRows.first_name,
                        IMEI_no: '0',
                        device: 'abcd',
                        last_logged_in: usersRows.last_login,
                        last_logged_out: usersRows.last_login,
                        IsBlocked: usersRows.status,
                        password: usersRows.password,
                        created_at: usersRows.created,
                        updated_at: usersRows.modified,
                        active: usersRows.status,
                        coins: usersRows.point,
                        role_id:usersRows.role_id
                    };
                    token = await getToken(usersRows);

                } else {
                    statusCode = 500;
                    message = 'Failed to update device ID';
                }
            } else {
                statusCode = 401;
                message = 'Password does not match!';
            }
        } else {
            statusCode = 401;
            message = 'Password or email does not match!';
        }
        const responseData = {
            status: statusCode,
            message,
            data,
            errors: error,
            token: token
        };

        res.send(responseData);
    } catch (error) {
        console.log(error)
        res.send({ authLogin: error });
    }
};


// const AlreadyLoggedin = async (req, res) => {
//     let message = null
//     let statusCode = 400
//     try {


//         const { email, device_id } = req.body;
//         // Check requeted user is exist or not

//         let user = await Users.find({ email: email });

//         const storedDeviceId = user[0]?.device_id;

//         // if (user.length > 0) {
//         if (storedDeviceId === device_id || !storedDeviceId) {
//             statusCode = 200
//             message = 'isAlreadyLoggedIn'

//         } else {
//             statusCode = 204
//             message = 'Login '
//         }
//         const responseData = {
//             status: statusCode,
//             message
//         }
//         res.send(responseData)

//     } catch (error) {
//         res.send({ error: error })
//     }
// };

const AlreadyLoggedin = async (req, res) => {
    try {
        const { email, device_id } = req.body;
        let user = await Users.findOne({ email: email });
        
        if (!user) {
            return res.json({ isAlreadyLoggedIn: false });
        }
        
        const storedDeviceId = user.device_id;
        
        // Return the response in the format Unity expects
        if (!storedDeviceId || storedDeviceId === device_id) {
            res.json({ isAlreadyLoggedIn: false });
        } else {
            res.json({ isAlreadyLoggedIn: true });
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const isAlreadyLoggedin = async (req, res) => {
    try {
        const { email, device_id } = req.body;

        let rows = await Users.find({ email: email });
        const storedDeviceId = rows[0]?.device_id;

        if (storedDeviceId === device_id || storedDeviceId === null) {
            res.json({ isAlreadyLoggedIn: false });
        } else {
            res.json({ isAlreadyLoggedIn: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// const updateDeviceId = async (email, newDeviceId) => {
//     try {

//         await Users.updateOne({ email }, { newDeviceId })
//         console.log('Device ID updated successfully.');
//         return true;
//     } catch (error) {
//         console.error('Error updating device ID:', error);
//         return false;
//     }
// };

const updateDeviceId = async (email, newDeviceId) => {
    try {
        await Users.updateOne({ email }, { device_id: newDeviceId }) // ✅ Correct field name
        console.log('Device ID updated successfully.');
        return true;
    } catch (error) {
        console.error('Error updating device ID:', error);
        return false;
    }
};

// const forceloginDeviceId = async (req, res) => {
//     let message = null
//     let statusCode = 400
//     try {
//         const { email, newDeviceId } = req.body

//         let user = await Users.updateOne({ email }, { newDeviceId })
//         if (user) {
//             statusCode = 200
//             message = 'force login successfully'

//         } else {
//             statusCode = 400
//             message = 'login not allowed '
//         }
//         const responseData = {
//             status: statusCode,
//             message
//         }
//         res.send(responseData)

//     } catch (error) {
//         res.send({ error: error })

//         console.log("updateDeviceId", error)
//     }
// }


const forceloginDeviceId = async (req, res) => {
    let message = null;
    let statusCode = 400;
    
    try {
        const { email, newDeviceId } = req.body;
        
        // First check if user exists
        const userExists = await Users.findOne({ email });
        if (!userExists) {
            return res.send({ status: 404, message: 'User not found' });
        }
        
        // Update with correct field name
        let user = await Users.updateOne({ email }, { device_id: newDeviceId }); // ✅ Correct
        
        if (user.modifiedCount > 0) {
            statusCode = 200;
            message = 'Force login successful, previous session terminated';
        } else {
            statusCode = 400;
            message = 'Failed to update device';
        }
        
        res.send({
            status: statusCode,
            message
        });
        
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}


const logout = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Clear the device_id
        await Users.updateOne({ email }, { device_id: null });
        
        res.send({
            status: 200,
            message: 'Logged out successfully'
        });
        
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};





const authSignUp = async (req, res) => {
    let message = null
    let register = false

    let statusCode = 400
    try {

        const { username, email, password } = req.body

        const encryptedPassword = await bcrypt.hash(password, 10)
        const formData = {
            username: username,
            email: email,
            password: encryptedPassword
        };

        let user = await Users.find({ email });

        if (user.length > 0) {
            statusCode = 401
            message = 'Sorry! Email already exist try another email'
        } else {

            let user = await Users.create(formData);
            if (user) {
                statusCode = 201
                message = "User created success"
                register = true
            } else {
                statusCode = 500
                message = "Something went wrong! database error"
            }
        }

        const responseData = {
            status: statusCode,
            message,
            register,

        }
        res.send(responseData)

    } catch (error) {
        res.send({ error: error })
    }
}


const resetPassword = async (req, res) => {
    let message = null;
    let statusCode = 400;

    try {
        const { email, old_password, new_password } = req.body;

        let user = await Users.find({ email });

        if (user.length > 0) {
            const userRow = user[0];
            const storedPassword = userRow.password;


            if (old_password === storedPassword) {
                let updateResult = await Users.updateOne({ email }, { password: new_password })

                if (updateResult) {
                    statusCode = 200;
                    message = 'Password changed successfully';
                } else {
                    statusCode = 500;
                    message = 'Something went wrong while changing the password';
                }
            } else {
                statusCode = 401;
                message = 'Old password does not match';
            }
        } else {
            statusCode = 400;
            message = 'User not found';
        }

        const responseData = {
            status: statusCode,
            message,
        };

        res.send(responseData);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// const updateAdminDetails = async (req, res) => {
//   try {
//     const { email, phone, upi } = req.body;

//     if (!email) {
//       return res.status(400).send({ message: 'Email is required' });
//     }

//     const user = await Users.findOne({ email });

//     if (!user) {
//       return res.status(404).send({ message: 'User not found' });
//     }

//     const updateFields = {};
//     if (phone) updateFields.phone = phone;
//     if (upi) updateFields.upi = upi;

//     // QR Code Upload Logic
//     if (req.files && req.files.qrCode) {
//       const file = req.files.qrCode;
//       const filename = `/img/admin/${user._id}/qrCode-${Date.now()}-${file.name}`;

//       // Remove old QR code image if it exists
//       if (user.qrCode) {
//         const oldFilePath = path.resolve(__dirname, '../../assets/' + user.qrCode);
//         deletDiskFile(oldFilePath);
//       }

//       // Upload new QR code image
//       uploadFile(req, filename, res);

//       updateFields.qrCode = filename;
//     }

//     // Update in DB
//     const result = await Users.updateOne({ email }, { $set: updateFields });

//     if (result.modifiedCount > 0) {
//       return res.status(200).send({ message: 'Admin details updated successfully' });
//     } else {
//       return res.status(200).send({ message: 'No changes made' });
//     }
//   } catch (error) {
//     return res.status(500).send({ message: 'Server error', error: error.message });
//   }
// };



const updateAdminDetails = async (req, res) => {
  console.log('req.files:', req.files);
  console.log('req.body:', req.body);

  try {
    const { email, phone, upi } = req.body;

    if (!email) {
      return res.status(400).send({ message: 'Email is required' });
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const updateFields = {};
    if (phone) updateFields.phone = phone;
    if (upi) updateFields.upi = upi;

    // Handle QR Code upload (accept either 'qrCode' or 'file' keys)
    const file = req.files?.qrCode || req.files?.file;
    if (file) {
      const filename = `/img/admin/${user._id}/qrCode-${Date.now()}-${file.name}`;

      // Delete old QR code if exists
      if (user.qrCode) {
        const oldPath = path.resolve(__dirname, '../../assets/' + user.qrCode);
        deletDiskFile(oldPath);
      }

      // Upload new file (await if uploadFile is async)
      await uploadFile(file, filename);

      updateFields.qrCode = filename;
    }

    const result = await Users.updateOne({ email }, { $set: updateFields });

    if (result.modifiedCount > 0) {
      return res.status(200).send({ message: 'Admin details updated successfully', qrCode: updateFields.qrCode });
    } else {
      return res.status(200).send({ message: 'No changes made' });
    }

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).send({ message: 'Server error', error: error.message });
  }
};



const getAdminDetails = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(email,"ncnejen");
    const user = await Users.findOne({ email }, { phone: 1, upi: 1,qrCode:1, _id: 0 });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    return res.status(200).send({ phone: user.phone, upi: user.upi, qrCode:user.qrCode });
  } catch (error) {
    return res.status(500).send({ message: 'Server error', error: error.message });
  }
};

const getAdmin = async (req, res) => {
  try {
    const user = await Users.findOne(
      { role_id: 0 },
      { phone: 1, upi: 1, _id: 0, qrCode:1 }
    );

    console.log(user,"anshhul");

    if (!user) {
      return res.status(404).send({ message: 'Admin user not found' });
    }

    return res.status(200).send({ phone: user.phone, upi: user.upi ,qrCode:user.qrCode });

  } catch (error) {
    return res.status(500).send({ message: 'Server error', error: error.message });
  }
};








async function getRoleIdFromEmail(request, response) {
    try {
        const email = request.body.email;

        const userResults = await AppService.userByEmail(email);
        if (!userResults || userResults.role_id !== null) {
            const roleId = userResults.role_id;
            response.send({ roleId });
        } else {

        }
    } catch (error) {
        console.error('Error occurred while executing queries:', error);
        response.send({ error: 'An error occurred' });
    }
}

const adduserbyadmin = async (req, res) => {
    //not using
    let message = null
    let register = false

    let statusCode = 400
    try {

        const { full_name, email, password, role_id,idManager } = req.body

        

        const encryptedPassword = password;//await bcrypt.hash(password, 10)
        const formData = {
            full_name: full_name,
            idManager: idManager,
            email: email,
            password: encryptedPassword,
            role_id
        };
        if (req.user.role_id !== 0) {
            throw new Error('Not Allowed');

        }
        let adminDoc = await Users.findOne({ role_id: 1 }).sort({ count: -1 }).select('count');
        let stateId = '';
        let count = 1;
        // if (!adminDoc) {
        //     stateId = 'GK00100001';
        // } else {
        //     count = adminDoc.count;
        //     stateId = `GK001000${adminDoc.count.toString().padStart(2, '0')}`;
        // }
        if (role_id == 1) {
            let user = await AppService.userByEmail(email);


            if (user) {
                statusCode = 201
                message = 'Sorry! Email already exist try another email'
            } else {
                formData['email'] = email;
                formData['count'] = count + 1;

                user = await Users.create(formData);

                if (user) {
                    statusCode = 200
                    message = "SuperMaster created success"
                    register = true
                } else {
                    statusCode = 500
                    message = "Something went wrong! database error"
                }
            }
        }

        const responseData = {
            status: statusCode,
            message,
            register,

        }
        res.send(responseData)

    } catch (error) {
        console.log(error)
        res.send({ error: error })
    }
}


const createStateId = async (req, res) => {
    let message = null;
    let register = false;
    let statusCode = 202;

    try {
        const { idManager, mini_id, email, password, role_id } = req.body;
        const formData = {
            idManager: idManager,
            //  admin_number: admin_number,
            email: email,
            password: password,
            role_id: 2,

        };


        let stateDoc = await Users.findOne({ idManager: idManager, role_id: 2 }).sort({ count: -1 }).select('count');
        let stateId = '';
        let count = 1;
        const firstFourCharacters = idManager.slice(0, 2);

        // if (!stateDoc) {
        //     stateId = 'GK01000000';
        // } else {

        //     let prefix = `GK${stateDoc.count.toString().padStart(2, '0')}`;
        //     count = stateDoc.count;
        //     stateId = prefix + '000000';
        // }


        const user = await AppService.userByEmail(email);


        let user1 = await Users.findOne({ email: idManager, role_id: 1 });


        if (user) {
            message = 'Sorry! Email already exists, please use another email.';
        } else if (!user1) {
            message = 'Sorry! Manager Not Found.';
        }
        else {

            formData['email'] = email;
            formData['count'] = 1 + parseInt(count);

            let newUser = await Users.create(formData);
            if (newUser) {
                statusCode = 200;
                message = "User created successfully.";
                register = true;
            } else {
                statusCode = 500;
                message = "Something went wrong! Database error.";
            }
        }

        return res.status(statusCode).json({
            status: statusCode,
            message: message,
            register: register,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
        });
    }
};


const createCityId = async (req, res) => {
    let message = null;
    let register = false;
    let statusCode = 202;

    try {
        const { admin_number, email, password, role_id, state_id, idManager } = req.body;

        const formData = {
            //   admin_number: admin_number,
            email: email,
            password: password,
            role_id: 3,
            idManager: idManager,
        };

        let cityDoc = await Users.findOne({ idManager: idManager, role_id: 3 }).sort({ count: -1 }).select('count');
        let newId = '';
        let count = 1;
        const firstFourCharacters = idManager.slice(0, 4);

        // if (!cityDoc) {
        //     newId = firstFourCharacters + '010000';
        // } else {

        //     let prefix = `${firstFourCharacters}${cityDoc.count.toString().padStart(2, '0')}`;
        //     newId = prefix + '0000';
        //     count = cityDoc.count
        // }
        console.log('newId', newId, cityDoc);

        // return res.json({newId});
        const user = await AppService.userByEmail(email);

        let user1 = await Users.findOne({ email: idManager, role_id: 2 });

        if (user) {
            message = 'Sorry! Email already exists, please use another email.';
        } else if (!user1) {
            message = 'Sorry! Manager Not Found.';
        } else {

            formData['email'] = email;
            formData['count'] = 1 + parseInt(count);

            let newUser = await Users.create(formData);
            if (newUser) {
                statusCode = 200;
                message = "User created successfully.";
                register = true;
            } else {
                statusCode = 500;
                message = "Something went wrong! Database error.";
            }
        }

        return res.status(statusCode).json({
            status: statusCode,
            message: message,
            register: register,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
        });
    }
};

const createMainId = async (req, res) => {
    let message = null;
    let register = false;
    let statusCode = 202;
    var raArray = []
    console.log('req.body', req.body)
    try {
        const { admin_number, email, password, role_id, city_id, idManager } = req.body;
        const formData = {
            // admin_number: admin_number,
            email: email,
            password: password,
            role_id: 4,
            idManager: idManager,
        };

        let mainDoc = await Users.findOne({ idManager: idManager, role_id: 4 }).sort({ count: -1 }).select('count');
        let newId = '';
        let count = 1;
        const firstFourCharacters = idManager.slice(0, 6);

        if (!mainDoc) {
            newId = firstFourCharacters + '0100';
        } else {

            let prefix = `${firstFourCharacters}${mainDoc.count.toString().padStart(2, '0')}`;
            newId = prefix + '00';
            count = mainDoc.count
        }
        console.log('newId', newId, mainDoc);

        const user = await AppService.userByEmail(email);

        let user1 = await Users.findOne({ email: idManager, role_id: 3 });

        if (user) {
            message = 'Sorry! Email already exists, please use another email.';
        } else if (!user1) {
            message = 'Sorry! Manager Not Found.';
        } else {

            formData['email'] = email;
            formData['count'] = 1 + parseInt(count);

            let newUser = await Users.create(formData);
            if (newUser) {
                statusCode = 200;
                message = "User created successfully.";
                register = true;



            } else {
                statusCode = 500;
                message = "Something went wrong! Database error.";
            }
        }

        return res.status(statusCode).json({
            status: statusCode,
            message: message,
            register: register,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
        });
    }
};

const createPlayerId = async (req, res) => {
    let message = null;
    let register = false;
    let statusCode = 202;

    try {
        const { admin_number, email, password, role_id, main_id, idManager } = req.body;

        const formData = {
            //  admin_number: admin_number,
            email: email,
            password: password,
            role_id: 5,
            idManager: idManager,
        };

        // let sql = `SELECT * FROM users WHERE LOWER(email) = ? LIMIT ?`;
        // let user = await conn.query(sql, [formData.email.toLowerCase(), 1]);
        let playerDoc = await Users.findOne({ idManager: idManager, role_id: 5 }).sort({ count: -1 }).select('count');
        let newId = '';
        let count = 1;
        const firstCharacters = idManager.slice(0, 8);

        // if (!playerDoc) {
        //     newId = firstCharacters + '01';
        // } else {
        //     newId = `${firstCharacters}${playerDoc.count.toString().padStart(2, '0')}`;
        //     count = playerDoc.count
        // }
        let user = await Users.findOne({ email });


        let user1 = await Users.findOne({ email: idManager, role_id: 4 });


        if (user) {
            message = 'Sorry! Email already exists, please use another email.';
        } else if (!user1) {
            message = 'Sorry! Manager Not Found.';
        } else {

            formData['email'] = email;
            formData['count'] = 1 + parseInt(count);

            let newUser = await Users.create(formData);

            if (newUser) {
                statusCode = 200;
                message = "User created successfully.";
                register = true;
            } else {
                statusCode = 500;
                message = "Something went wrong! Database error.";
            }
        }

        return res.status(statusCode).json({
            status: statusCode,
            message: message,
            register: register,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
        });
    }
};


const getPlayerVendor = async (req, res) => {
    let message = null;
    let register = false;
    let statusCode = 200;

    try {
        const { admin_number, password, role_id, main_id, idManager } = req.body;

        const formData = {
           
        };

     
        let playerDoc = await Users.findOne({ idManager: idManager, role_id: 5 }).sort({ count: -1 }).select('count');
        let newId = '';
        let count = Math.floor(Math.random() * 90) + 10;
        const firstCharacters = idManager.slice(0, 8);
        newId = `${firstCharacters}${count.toString().padStart(2, '0')}`;
        
        let email = newId;
        let user = await Users.findOne({ email });


        let user1 = await Users.findOne({ email: idManager, role_id: 4 });


        if (user) {
            message = 'Sorry! Email already exists, please use another email.';
        } else if (!user1) {
            message = 'Sorry! Manager Not Found.';
        } 
        return res.status(statusCode).json({
            status: statusCode,
            message: message,
            register: email,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
        });
    }
};

const getPass = async (req, res) => {
    var val = Math.floor(1000 + Math.random() * 9000);
    console.log("allusersValue:", val);
    res.send({
        statusCode: 200,
        message: "password generated",
        password: val
    })
};

const Checkplayerlist = async (req, res) => {
    let message = null;
    let statusCode = 400;
    var data = {};
    const { idManager } = req.body;
    try {

        let agent = await Users.find({ idManager });

        if (agent.length > 0) {
            statusCode = 200;
            message = "success";
 /*   var data1=[]
   for(i=0;i<agent.length;i++){
     data1.push(agent[i].email)
   }
        data = data1;
  */     } else {
            statusCode = 200;
            message = "detail not found";
        }
        const responseData = {
            status: statusCode,
            message,
            data: agent,
        };
        res.send(responseData);
    } catch (error) {
        res.status(500).send("Database error");
        console.log(error, "error")
    }
};

const changePassword = async (req, res) => {
    let message = null
    let statusCode = 400;
    
    try {

        const { email, newpassword } = req.body

        let targetuser = await Users.findOne({ email, idManager: req.user.email }).select({ role_id: 1, idManager: 1 });
    if (!targetuser) {
        statusCode = 400
        message = 'not allowed '
    }

        let user = await Users.updateOne({ email }, { password: newpassword });

        if (user) {
            statusCode = 200
            message = 'password changed successfully'

        } else {
            statusCode = 400
            message = 'login not allowed '
        }
        const responseData = {
            status: statusCode,
            message
        }
        res.send(responseData)

    } catch (error) {
        res.send({ error: error })

        console.log("updateDeviceId", error)
    }
}



const getToken = async (data) => {
    return jwt.sign({ id: data.id, role_id: data.role_id, email: data.email },
        process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    }

    );
}


// // 3. Better Solution: Implement Session Timeout on Backend:
// // In AuthController.js, modify the login check to include timeout:
// const AlreadyLoggedin = async (req, res) => {
//     try {
//         const { email, device_id } = req.body;
//         let user = await Users.findOne({ email: email });
        
//         if (!user) {
//             return res.json({ isAlreadyLoggedIn: false });
//         }
        
//         const storedDeviceId = user.device_id;
//         const lastActivity = user.last_activity || user.modified;
        
//         // Check if last activity was more than 30 minutes ago
//         const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
//         if (lastActivity && new Date(lastActivity) < thirtyMinutesAgo) {
//             // Session expired, clear device_id
//             await Users.updateOne({ email }, { device_id: null });
//             return res.json({ isAlreadyLoggedIn: false });
//         }
        
//         if (!storedDeviceId || storedDeviceId === device_id) {
//             res.json({ isAlreadyLoggedIn: false });
//         } else {
//             res.json({ isAlreadyLoggedIn: true });
//         }
        
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Update user activity on each important action
// const updateUserActivity = async (email) => {
//     await Users.updateOne({ email }, { last_activity: new Date() });
// };




module.exports = {
    authLogin,
    authSignUp,
    //forgotPassword,
    resetPassword,
    adduserbyadmin,
    isAlreadyLoggedin,
    AlreadyLoggedin,
updateAdminDetails,
getAdminDetails,getAdmin,
    getRoleIdFromEmail,
    forceloginDeviceId,
    createStateId,
    getPass,
    createCityId,
    createMainId,
    createPlayerId,getPlayerVendor,
    Checkplayerlist,
    changePassword,
    logout
}
