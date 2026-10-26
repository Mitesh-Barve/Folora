import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios, { AxiosError } from "axios"
import { useRecoilValue, useResetRecoilState } from "recoil"
import { Dropdown } from "./Dropdown"
import { DropdownOpt } from "./dropdownOpt"
import { USERS_BACKEND_URL } from "../../config"
import { userId, userLoginAtom, verifiedEmail } from "../../store/atoms/userInfoAtom"
import { SearchBar } from "./SearchBar"
import { CreateBlog } from "./CreateBlog"
import { Publish } from "./Publish"
import { toast } from "sonner"

type Prop = {
    className?: string
}
export const NavLinks = ({ className }: Prop) => {
    const navigate = useNavigate();
    const userLogin = useRecoilValue(userLoginAtom)

    // reset recoil states on logout
    const resetVerify = useResetRecoilState(verifiedEmail)
    const resetUserId = useResetRecoilState(userId)
    const resetLogin = useResetRecoilState(userLoginAtom)
    const [drop, setDrop] = useState(false)
    // defining window.scrollY directly won't affect in the className. It is a dynamic event so you have to use useEffect() to track the changes 
    const [scroll, setScroll] = useState(false)
    useEffect(() => {
        const handleScroll = () => {
            setScroll(window.scrollY > 0)
        }
        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [scroll])

    // logout
    const handleLogout = async () => {
        try {
            await axios.post(`${USERS_BACKEND_URL}/logout`, {}, { withCredentials: true })
            resetUserId();
            resetVerify();
            resetLogin();
            toast.success("User Logout Success")
            navigate("/");
            return;
        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.response?.status === 500) {
                    resetUserId();
                    resetVerify();
                    resetLogin();
                    navigate("/");
                    return;
                }
            }
        }
    }
    return (
        <>

            {scroll && <div className="h-[60px]"> </div>}
            <div className={` ${scroll ? "fixed" : "static"} top-0 left-0 w-full h-[60px] bg-surface/85 backdrop-blur-md border-b border-stone-200 z-50 ${className} `}>
                <ul className="flex items-center justify-around gap-4 lg:gap-1 my-auto w-full ">
                    {/* logo */}
                    <div className="flex justify-center items-center">
                        <li>
                            <button onClick={() => navigate("/")} className="border-none outline-none  ">
                                <img src="/logo.svg" alt="logo" className=" w-[120px] border-none outline-none " />
                            </button>
                        </li>
                    </div>
                    {/* search Bar */}
                    {/* supposed to be rendered only on /blog page */}
                    {window.location.pathname === "/blog" &&
                        <div className="relative">
                            <SearchBar />
                        </div>
                    }

                    {
                        userLogin ?
                            // user is logged in represent his image and on click show dropdown with logout button & profile button  
                            <div className="flex items-center space-x-8">
                                {
                                    window.location.pathname !== "/editor" ?
                                        <li className="hidden md:block">
                                            <CreateBlog />
                                        </li>
                                        :
                                        <li className="pt-1" >
                                            <Publish />
                                        </li>
                                }
                                <li>
                                    <Dropdown onClick={() => setDrop(!drop)} />
                                    <div >
                                        <div className={` ${drop ? "transition transform duration-150 ease-in-out scale-100 " : " opacity-0 scale-0"} absolute w-screen h-screen bg-canvas/70 backdrop-blur-xl  right-0 top-0  `} >
                                            <button className="absolute top-6 right-6 w-8 h-8 transition-transform hover:scale-110" onClick={() => setDrop(!drop)}> <img src="/dropclose.svg" alt="closesvg" /></button>

                                            <div className="flex flex-col gap-4 justify-center items-center h-screen">
                                                <DropdownOpt onclick={() => navigate("/userProfile")} text="User Profile" svg="/user.svg" />
                                                <DropdownOpt onclick={() => navigate("/editor")} text="Create Blog" svg="/blogWrite.svg" className="md:hidden" />
                                                <DropdownOpt onclick={() => navigate("/myblogs")} text="My Blogs" svg="/blog.svg" />
                                                <DropdownOpt onclick={() => navigate("/savedBlogs")} text="Saved Blogs" svg="/saved.svg" />
                                                <DropdownOpt onclick={handleLogout} text="Log Out" svg="/logout.svg" />
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </div>
                            :
                            <>
                                {/* signup */}
                                <div className="flex gap-3 pt-3">
                                    <li>
                                        <Link className="block text-center w-[84px] px-1 py-1.5 font-medium btn-ghost" to={"/signup"}>Sign Up</Link>
                                    </li>
                                    {/* signin */}
                                    <li>
                                        <Link className=" block w-[84px] text-center px-1 py-1.5 font-medium btn-primary " to={"/login"}>Log In</Link>
                                    </li>
                                </div>
                            </>
                    }
                </ul >
            </div >
        </>
    )
}

