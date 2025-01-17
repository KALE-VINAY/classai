
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {checkValideData} from "../utils/validate";
import {createUserWithEmailAndPassword , signInWithEmailAndPassword,GoogleAuthProvider,
  signInWithPopup  } from "firebase/auth";
import {auth} from "../utils/firebase";
import {updateProfile } from "firebase/auth";
// import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { addUser ,removeUser } from '../utils/userSlice';
import { BG_URL, USER_AVATER } from '../utils/constants';

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [loading, setLoading] = useState(false); // Loading state
  const [errorMessage , setErrorMessage] = useState(null);
  const [showValidationHints, setShowValidationHints] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = useRef(null);
  const password = useRef(null);
  const name = useRef(null);  

  const handleGoogleSignIn = async () => {
    setLoading(true); // Start loading
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get user info
      const user = result.user;
      
      // Update Redux store with user info
      const { uid, email, displayName, photoURL } = user;
      dispatch(addUser({ uid, email, displayName, photoURL }));
      
      // Navigate to landing page on success
      navigate("/landing-page");
    } catch (error) {
      setErrorMessage(error.code + " - " + error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const toggleSignInForm = () => {
    setIsSignInForm(!isSignInForm);
    setErrorMessage(null);
    setShowValidationHints(false);
  };
  
  const handleButtonClick = async () => {
    const message = checkValideData(email.current.value, password.current.value);
    setErrorMessage(message);

    if (message) {
      setShowValidationHints(true);
      return;
    }

    setLoading(true); // Start loading

    try {
      if (!isSignInForm) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.current.value, password.current.value);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: name.current.value,
          photoURL: USER_AVATER,
        });

        const { uid, email: userEmail, displayName, photoURL } = auth.currentUser;
        dispatch(addUser({ uid, email: userEmail, displayName, photoURL }));
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.current.value, password.current.value);
        const user = userCredential.user;
        // Handle sign-in success if needed
      }
    } catch (error) {
      setErrorMessage(error.code + " - " + error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };


  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       const { uid, email, displayName, photoURL } = user;
  //       dispatch(addUser({ uid, email, displayName, photoURL }));
  //       navigate("/landing-page");
  //     } else {
  //       dispatch(removeUser());
  //       navigate("/");
  //     }
  //   });
  //   return () => unsubscribe();
  // }, [navigate, dispatch]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email, displayName, photoURL } = user;
        const userData = { uid, email, displayName, photoURL };
        dispatch(addUser(userData));
        
        // Get redirect path from localStorage or default to landing page
        const redirectPath = localStorage.getItem('redirectPath') || '/landing-page';
        localStorage.removeItem('redirectPath'); // Clean up
        navigate(redirectPath);
      } else {
        dispatch(removeUser());
        if (window.location.pathname !== '/') {
          navigate('/');
        }
      }
    });
    
    return () => unsubscribe();
  }, [navigate, dispatch]);
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      {/* <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover" 
          src='http://www.tezu.ernet.in/images/tu3.jpg' 
          alt="bg img"
        />
      </div> */}
          {/* Video Background with Overlay */}
    
      
          <video
         autoPlay
         loop
         muted
         playsInline
         className="fixed mb-24 inset-0 w-full h-full object-cover "
       >
         <source src="/TUDroneShot.mp4" type="video/mp4" />
           Your browser does not support the video tag.
        </video>


      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md px-4">
        <form 
          onSubmit={(e) => e.preventDefault()} 
          className="
            w-full 
            p-6 
            md:p-8 
            bg-white/50 
            backdrop-blur-sm 
            rounded-xl 
            shadow-lg 
            border 
            border-gray-200
          "
        >
          {/* Form Title */}
          <h1 className="
            text-center 
            font-bold 
            font-serif 
            text-3xl 
            md:text-4xl 
            py-4 
            text-gray-800
          ">
            {isSignInForm ? "Sign In" : "Sign Up"}
          </h1>

          {/* Name Input (Signup Only) */}
          {!isSignInForm && (
            <input 
              ref={name}
              type="text" 
              placeholder="Full name" 
              className="
                w-full 
                p-3 
                md:p-4 
                my-2 
                bg-white 
                text-gray-800 
                rounded-lg 
                border 
                border-gray-300 
                focus:outline-none 
                focus:ring-2 
                focus:ring-gray-500
              "
            />
          )}

          {/* Email Input */}
          <input 
            ref={email}
            type="text" 
            placeholder="Email address" 
            className="
              w-full 
              p-3 
              md:p-4 
              my-2 
              bg-white 
              text-gray-800 
              rounded-lg 
              border 
              border-gray-300 
              focus:outline-none 
              focus:ring-2 
              focus:ring-gray-500
            "
          />

          {/* Password Input */}
          <input 
            ref={password}
            type="password" 
            placeholder="Password" 
            className="
              w-full 
              p-3 
              md:p-4 
              my-2 
              bg-white 
              text-gray-800 
              rounded-lg 
              border 
              border-gray-300 
              focus:outline-none 
              focus:ring-2 
              focus:ring-gray-500
            "
          />

      

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 font-bold text-sm md:text-lg py-2 text-center">
              {errorMessage}
            </p>
          )}

          {/* Validation Hints */}
          {showValidationHints && !isSignInForm && (
            <div className="text-yellow-700 text-xs md:text-sm py-2">
              <p className="font-semibold mb-1">Password must include:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>At least 8 characters long</li>
                <li>One special character (@, #, $, !, etc.)</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
              </ul>
              <p className="mt-2 text-center">Email should be in format: username@domain.com</p>
            </div>
          )}

          {/* Submit Button */}
          <button 
            className="
              w-full 
              p-3 
              md:p-4 
              my-4 
              bg-gray-700 
              text-white 
              rounded-lg 
              hover:bg-gray-800 
              transition-colors 
              duration-300
            " 
            onClick={handleButtonClick}
          >
            {isSignInForm ? "Sign In" : "Sign Up"}
          </button>

          {/* Toggle Form Type */}
          <p 
            className="
              text-center 
              py-2 
              cursor-pointer 
              font-serif 
              text-gray-700 
              hover:text-gray-900 
              transition-colors 
              duration-300
            " 
            onClick={toggleSignInForm}
          >
            {isSignInForm 
              ? "New to here? Sign up now" 
              : "Already a member? Sign in"}
          </p>

<p className='flex justify-center text-gray-700 font-serif  '>or</p>

             {/* Google Sign In Button */}
         <button 
            type="button"
            onClick={handleGoogleSignIn}
            className="
              w-full 
              p-3 
              md:p-4 
              my-2 
              bg-white 
              text-gray-700 
              border 
              border-gray-300 
              rounded-lg 
              hover:bg-gray-50 
              transition-colors 
              duration-300 
              flex 
              items-center 
              justify-center 
              gap-2
            "
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;