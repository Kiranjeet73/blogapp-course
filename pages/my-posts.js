import { postsbyUsername } from "./../src/graphql/queries";
import  {Auth, API, Storage } from "aws-amplify";
import { useEffect, useState } from "react";
import  Link  from "next/link";
import Moment from "moment";
import {deletePost as deletePostMutation} from '../src/graphql/mutations';


export default function MyPosts(){
const [posts, setPosts] = useState([]);



useEffect(() =>{
fetchPosts()
},[]);

async function fetchPosts(){
    const {username} = await Auth.currentAuthenticatedUser();
    const postData = await API.graphql({
        query: postsbyUsername,
        variables: {username},
         });
// to get image thumnails
         const {items} = postData.data.postsbyUsername

         //Fetch images from S3 for posts that contain a cover image
         const postWithImages = await Promise.all(
           items.map(async(post) =>{
             if(post.coverImage){
               post.coverImage = await Storage.get(post.coverImage)
             }
             return post
           })
         )
         setPosts(postWithImages)
   
   // setPosts(postData.data.postsbyUsername.items)
    }

async function deletePost(id){
    await API.graphql({
        query: deletePostMutation,
        variables:{input:{id}},
        authMode:"AMAZON_COGNITO_USER_POOLS"
    })
    fetchPosts();
}




return (
    <div>
    
        
   { posts.map((post, index) => (
    <div key={index} className="py-8 px-8 max-w-xxl mx-auto bg-white rounded-xl sm:items-center sm:space-y-0 sm:space-x-6 mb-2">
       
       {
          post.coverImage && (
            <img alt="photo" className="w-36 h-36 bg-contain bg-center rounded-full sm:mx-0 sm:shrink-0"
            src={post.coverImage}
            />
          )
        }

        <div  className="text-center space-y-2 sm:text-left">
            <div className="space-y-0.5">
                <p className="text-lg text-black font-semibold">{post.title}</p>
                <p className="text-slate-500 font-medium">
                    Created on: {Moment(post.createdAt).format("ddd, MMM hh:mm a")}</p>
            
            <div className="sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-1">
                <p className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl"><Link href={`/edit-post/${post.id}`}>Edit Post</Link></p>
                <p className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl"><Link href={`/posts/${post.id}`}>View Post</Link></p>
                <button className="text-sm mr-4 text-red-500" onClick={() => deletePost(post.id)}><Link href={`/my-posts`}>Delete Post</Link></button>

            </div>
        </div>
        </div>
        </div>
    ))

   }
    </div>
  
);
 
}