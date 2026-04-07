const jwt 				= require('jsonwebtoken');
const globalVariable	= require('../../../nodemonConfig.js');
const Users 			= require('../userManagementnew/ModelUsers.js');

const auth = (req, res, next) => {
	// console.log("req.headers.authorization => ",req.headers)
	if(req.headers.authorization){
	    const token = req.headers.authorization.split(" ")[1];
			// console.log("token => ",token)
			// console.log("globalVariable.JWT_KEY => ",globalVariable.JWT_KEY)
	    	const data = jwt.verify(token, globalVariable.JWT_KEY,(err,decode)=>{
	    		// console.log("decode ====> ",decode);
	    	if(err){
	    		// console.log("err ====> ",err);
				res.status(401).json("Not authorized to access this resource");
	    	}else{
	    		try{
	    			getData();
	    			async function getData(){
			    		const user = await Users.aggregate([
			        											{
			        												$match : { "_id" : decode.userId}
			        											},
														  		{
														    		$project: {
														      			loginToken: {$arrayElemAt: ["$services.resume.loginTokens", 1]}
														    		}
														  		},
														  		{
														    		$match: {"loginToken.hashedToken": token}
														  		}
														]);
			    		req.token = token;
			    		next();
	    			}
	    		}catch(error){
	    			res.status(401).send({ error: 'Not authorized to access this resource' })
	    		}
	    	}
	    });
	}else {
		res.status(401).send({ error: 'Not authorized to access this resource' });
	}
}
module.exports = auth
