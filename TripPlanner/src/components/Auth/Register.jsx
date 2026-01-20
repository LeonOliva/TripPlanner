/*import React from "react";
import styles from "./Auth.module.css";
import { useForm } from "react-hook-form";

function Register() {
    const {
        register,
        handleSubmit,
        formState:{errors}
    }=useForm();
    const submitCall=(data)=>{
        console.log(data);
    }
    return(
    <div className={styles.authContainer}>
        <form className={styles.authForm} onSubmit={handleSubmit(submitCall)}>
            <h2 className={styles.authTitle}>Create an Account</h2>
            <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>Name</label>
                <input id="name" {...register("name", {
                    required:"Name is required",
                    minLength:{
                        value:3,
                        message:"Name must be at least 3 characters"
                    }
                }
                )} type="text" className={styles.input}/>
                {errors.name &&<div>{error.name.message}</div>}             
                <label htmlFor="surname" className={styles.label}>Surname</label>
                <input id="surname" {...register("surname", {
                required:"Surname is required",
                minLength:{
                    value:3,
                    message:"Surname must be at least 3 characters"
                    }
                }
                )} type="text" className={styles.input}/>
                {errors.surname &&<div>{error.surname.message}</div>}    
                <label htmlFor="email" className={styles.label}>Email</label>
                <input id="email" {...register("email", {
                    required:"Email is required",
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address',
                    },
                })} type="text" className={styles.input}/>
                {errors.email &&<div>{error.email.message}</div>}    
                <label htmlFor="mobile" className={styles.label}>Mobile</label>
                <input id="mobile" {...register("mobile", {
                    required:"Mobile is required",
                    minLength: {
                        value: 10,
                        message:"Mobile must be at least 10 numbers"
                    }
                }
                )} type="text" className={styles.input}/>
                {errors.mobile &&<div>{error.mobile.message}</div>}    
                <label htmlFor="password" className={styles.label}>Password</label>
                <input id="password" {...register("password")} type="text" className={styles.input}/>
                <button type="submit" className={styles.submitButton}>Register</button>

                <p className={styles.toggleText}>Already have an account? Login</p>
            </div>
        </form>
    </div>
    )
}
export default Register;*/
