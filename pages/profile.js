import { withAuthenticator, AmplifySignOut, Button } from "@aws-amplify/ui-react";
import { Amplify, Auth } from "aws-amplify";
import { useState, useEffect } from "react";
import CreatePost from "./create-post";


function Profile({signOut}){
    const [user, setUser] = useState(null);
    
    useEffect(() =>{
        checkUser();
    }, [])

    async function checkUser(){
        const user = await Auth.currentAuthenticatedUser()
        setUser(user);
    }

    if (!user) return null;
  return(
    
        <div>
           
            <h1 className="text-3xl font-semibold tracking-wide mt-6">Profile</h1>
            <h2 className="font-medium txt-gray-500 my-2">Username:{user.username}</h2>
            <p className="text-sm text-gray-500 mb-6">Email:{user.attributes.email}</p>
            <Button onClick={signOut}>Sign out</Button>
          
            
        </div>
        
    );

    }
    
export default withAuthenticator(Profile);

