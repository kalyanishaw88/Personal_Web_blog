import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate , useLocation} from 'react-router-dom';
import { UserContext } from "../context/userContext";
import axios from 'axios'
import Loader from '../components/Loader';

const DeletePost = ({postId: id}) => {
  const navigate = useNavigate();  // Correct use of useNavigate inside the component
  const location= useLocation()
  const[isLoading, setIsLoading]=useState(false)


  const { currentUser } = useContext(UserContext); // Correct use of useContext inside the component
  const token = currentUser?.token; // Safe access to currentUser's token

  useEffect(() => {
    if (!token) {
      navigate('/login'); // Redirect to login if no token is found
    }
  }, [token, navigate]);  // Add `navigate` as a dependency to avoid warnings

  const removePost= async()=>{
    setIsLoading(true)
    try{
      const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/posts/${id}`, {withCredentials:
        true, headers: {Authorization: `Bearer ${token}`}})
        if(response.status ==200){
          if(location.pathname== `/myposts/${currentUser.id}`){
            navigate(0)
          }else{
            navigate('/')
          }
        }
        setIsLoading(false)

    }catch(error){
   console.log("could not delete post.")
    }
  }

  if(isLoading){
    return <Loader/>
  }

  return (
   <Link className='btn sm danger' onClick={()=>removePost(id)}>Delete</Link>
  );
}

export default DeletePost;
