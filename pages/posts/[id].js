import { API, Storage, Auth } from 'aws-amplify';
import { useRouter } from 'next/router';
import  ReactMarkdown  from 'react-markdown';
import '../../configureAmplify';
import { listPosts, getPost } from '../../src/graphql/queries';
import { useEffect, useState } from 'react';
import { createComment } from '../../src/graphql/mutations'; 
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";
import {v4 as uuid} from "uuid"



const SimpleMDE = dynamic(() => import(
    "react-simplemde-editor"
),{ssr: false}
)



const intialState ={message:""}

export default function Post({post}) {
    const [signedInUser, setSignedInUser] = useState(true);
     const router = useRouter();
    const [coverImage, setCoverImage] = useState(null)
    const [comment, setComment] = useState(intialState);
    const [showMe, setShowMe] = useState(false);
    const {message} = comment
    function toggle(){
        setShowMe(!showMe)
    }

useEffect(() =>{
    updateCoverImage()

    async function updateCoverImage(){
        if (post.coverImage){
            const imageKay = await Storage.get(post.coverImage)
            setCoverImage(imageKay);
        }
    }
},[post.coverImage])



    if (router.isFallback){
        return <div>Loading...</div>;
    }

    async function createTheComment(){
        if(!message) return
        const id =uuid()
        comment.id = id

     

        
        try {
            await API.graphql({
                query: createComment,
                variables:{input: comment},
                authMode:"AMAZON_COGNITO_USER_POOLS"
            })
        } catch(error){
            console.log(error)
        }
        router.push("/my-posts")
    }

    return (
        <div>
            <h1 className='text-5xl mt-4 font-semibold tracing-wide'>
                {post.title}
            </h1>
            {
                coverImage && (
                    <img alt='photo'
                    className='h-auto max-w-lg mx-auto'
                    src={coverImage}/>
                )
            }
            <p className='text-sm font-light my-4'>By {post.username}</p>
            <div className='mt-8'>
                <ReactMarkdown className="prose">{post.content}</ReactMarkdown></div>
                <div>
                    {signedInUser &&(
                        <button 
                        type='button'
                        className='mb-4 bg-green-600 text-white font-semibold px-8 py-2 rounded-lg'
                        onClick={toggle}
                        >Write a Comment</button>

                    )}
                    
                    {
                        <div style={{display:showMe ? "block" : "none"}}>
                           
                        <SimpleMDE
                        value={comment.message}
                        onChange={(value) =>
                        setComment({...comment, message:value, postID:post.id})}
                        />
                      
                        <button 
                        onClick={createTheComment}
                        type="button"
                        className='mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg'>Save</button>
                    </div>
                    }
                </div>
            </div>
    );
}

export async function getStaticPaths(){
    const postData = await API.graphql({
        query:listPosts
    })
    const paths = postData.data.listPosts.items
    .map((post) => ({params: {id:post.id},}))
    return {
        paths,
        fallback: true
    }
}


export async function getStaticProps({params}){
    const {id} = params;
    const postData = await API.graphql({
        query: getPost,
        variables:{id}
    })
    return{
        props:{
            post: postData.data.getPost
        },
       
        revalidate: 1
    }
    
}