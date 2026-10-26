import { useNavigate } from "react-router-dom"
import { HomeImg } from "../components/HomeImg";
import { useRecoilValue } from "recoil";
import { userLoginAtom } from "../store/atoms/userInfoAtom";
import { useEffect } from "react";
import { NavLinks } from "../components/NavBar/NavLinks";
import { motion } from "motion/react";
export const Home = () => {
    const title = "Words That Matter!"
    const subtitle = "Folora is a quiet, premium home for essays and stories — where thoughts take shape and writing finds its readers."

    const navigate = useNavigate();
    // since i will store the respose from useAuth() in the recoil atom i will directly use the atom value here for validation rather defining a new useAuth()

    const userLogin = useRecoilValue(userLoginAtom)
    useEffect(() => {
        if (userLogin === true) {
            navigate("/protected")
        }
    }, [userLogin, navigate])

    const handleClick = () => {
        navigate('/login')
    }

    const parent = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }
    // const children = {
    //     initial: { opacity: 0, y: 100 },
    //     animate: {
    //         opacity: 1,
    //         y: 0,
    //         transition: {
    //             staggerChildren: 0.2,
    //             duration: 0.3
    //         }
    //     }
    // }
    return (
        <>
            <NavLinks className="fixed" />
            {/* div of grid having 2 cols on large screen, one side text other side image */}
            <div className=" lg:grid lg:grid-cols-2 w-screen h-screen bg-canvas  ">
                {/* div containing contents  */}
                <motion.div
                    variants={parent}
                    initial="initial"
                    animate="animate"
                    className=" flex flex-col justify-center h-[60vh] lg:h-screen px-6 md:px-12 lg:ml-[6rem] max-w-2xl "
                >

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-accent-ink ">
                        Folora
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-neutral-900"
                    >
                        {title}
                    </motion.h1>
                    <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
                        className="mt-6 block h-[3px] w-16 origin-left rounded-full bg-accent "
                    />
                    <motion.p
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="mt-5 text-muted text-lg md:text-2xl font-normal max-w-xl ">
                        {subtitle}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className=" pt-8 ">
                        <button
                            className="h-12 px-7 text-base font-medium btn-primary rounded-full"
                            onClick={handleClick}>
                            Start Reading
                        </button>
                        <button
                            className="ml-3 h-12 px-7 text-base font-medium btn-ghost rounded-full"
                            onClick={() => navigate('/signup')}>
                            Start Writing
                        </button>
                    </motion.div>
                </motion.div>
                {/* image on large screen */}
                <HomeImg />
            </div>
        </>
    )
}
