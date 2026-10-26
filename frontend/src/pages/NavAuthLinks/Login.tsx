import { useNavigate } from "react-router-dom"
import { Button } from "../../components/Buttons/Button"
import { InputBox } from "../../components/InputBox"
import { Testimonial } from "../../components/Testimonial"
import axios, { AxiosError } from "axios"
import { LoginSchema } from "@om_wadhi/common"
import { useState } from "react"
import { USERS_BACKEND_URL } from "../../config"
import { GoogleBtn } from "../../components/Buttons/GoogleBtn"
import { motion } from "motion/react"
import { toast } from "sonner"


export const Login = () => {

  const [email, setEmail] = useState<string>("")
  const [password, SetPass] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const RedirectLogin = () => {
    navigate('/signup')
  }
  const handleSignup = async () => {
    let newUser: LoginSchema = {
      email, password
    }
    setLoading(true)
    try {
      const response = await axios.post(`${USERS_BACKEND_URL}/login`, newUser, { withCredentials: true })
      if (response.status === 200) {
        toast.success("Login Successfull!")
        navigate("/protected")
      }
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 403) {
          toast.warning("Invalid Input! Please Try Again")
          navigate("/login")
        } else if (e.response?.status === 401) {
          toast.warning("Incorrect Password")
          navigate('/login')
        } else if (e.response?.status === 409) {
          toast.error("No User Found! Please Signup")
          navigate("/signup")
        }
      } else {
        toast.error("Internal Server Error")
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }
  const variant = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } }
  }
  return (
    <>
      <div className="grid lg:grid-cols-2 h-screen bg-canvas">
        <div className="flex flex-col justify-center items-center gap-3 ">
          <div className="flex flex-col gap-2 mb-7">
            <motion.h1 variants={variant} initial={'initial'} animate={"animate"} className="text-center font-semibold text-3xl md:text-4xl font-serif text-neutral-900 ">
              Login To Your Account
            </motion.h1>
            <motion.p variants={variant} initial={'initial'} animate={"animate"} className="text-center text-neutral-500 inline-block">
              Don't have an account ?
              <span className=" pl-2 cursor-pointer text-neutral-700 hover:text-primary underline " onClick={() => RedirectLogin()} >
                Sign Up
                <img src="redirect.svg" alt="redirect btn" className="inline-block w-4 h-4 ml-1 pb-[2px]" />
              </span>
            </motion.p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <motion.label variants={variant} initial={'initial'} animate={"animate"} htmlFor="email" className="text-gray-500">
                Email
              </motion.label>
              <InputBox
                type="email"
                setValue={setEmail}
                id="email"
                placeholder="example@gmail.com"></InputBox>

            </div>

            <div className="flex flex-col">
              <motion.label variants={variant} initial={'initial'} animate={"animate"}
                htmlFor="password"
                className="text-gray-500">
                Password
              </motion.label>
              <InputBox
                type="password"
                setValue={SetPass}
                id="password"
                placeholder="********"></InputBox>
            </div>
          </div>

          <Button onclick={handleSignup} className="mt-4" loading={loading} text="Login"></Button>
          <div className="flex flex-col gap-8 mt-3">
            <div className="flex items-center">
              <span className="w-20 h-px bg-neutral-300 " />
              <span className=" text-sm px-4 text-neutral-500  "> OR</span>
              <span className="w-20 h-px bg-neutral-300 " />
            </div>
            <div>
              <GoogleBtn accType="Login" />
            </div>
          </div>
        </div>
        <Testimonial className="hidden lg:block" ></Testimonial>
      </div>
    </>
  )
}
