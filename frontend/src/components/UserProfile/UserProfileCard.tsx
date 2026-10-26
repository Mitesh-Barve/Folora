
import { useNavigate } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { useRef, useState } from "react"
import { UserUpdate } from "@om_wadhi/common"
import axios, { AxiosError } from "axios"
import { USERS_BACKEND_URL } from "../../config"
import { UserEmailProfile } from "./UserEmailProfile"
import { verifiedEmail } from "../../store/atoms/userInfoAtom"
import CountDown from "../Counter/CountDown"
import { NavLinks } from "../NavBar/NavLinks"
import { ProfileStats } from "./ProfileStats"
import { toast } from "sonner"
import { ImageUploadButton } from "../ImageUploadButton"

type Props = {
    username: string
    email: string
    imageURL?: string | null
    onClickLogout: () => void
    onClickSendOtp: () => void
    box: boolean
    onClickVerify: () => void
}
export const UserProfileCard = ({ username, email, imageURL, onClickLogout, onClickSendOtp, box, onClickVerify }: Props) => {

    const navigate = useNavigate();
    const [edit, setEdit] = useState(false)
    const verified = useRecoilValue(verifiedEmail)

    const [changes, setChanges] = useState<UserUpdate>({
        username: username,
        email: email
    })
    const [avatarEdit, setAvatarEdit] = useState(false)
    const [avatarURL, setAvatarURL] = useState(imageURL ?? "")
    const [savedAvatarURL, setSavedAvatarURL] = useState(imageURL ?? "")
    const fieldUpdate = useRef<UserUpdate>({})  // just because there's no need of setState() function by the useState hook so useRef


    const handleChange = (field: string, changedVal: string) => {
        setChanges((prev) => ({
            ...prev, [field]: changedVal
        }))
    }
    // explanation to this is in README.md file
    const handleSave = async () => {
        try {
            if (changes.username !== username) {
                fieldUpdate.current.username = changes.username
            }
            if (changes.email !== email) {
                fieldUpdate.current.email = changes.email
            }
            if (changes.username === username && changes.email === email) {
                // console.log("No changes were made "); instead you can add a custom popup containing
                setEdit(false)
                return
            }

            const res = await axios.put(`${USERS_BACKEND_URL}/updateUser`, fieldUpdate, { withCredentials: true })
            if (res.status === 200) {
                toast.success("User Info Updated Successfully")
                setEdit(false)
            }

        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.response?.status === 401) {
                    toast.error("User Unauthorized")
                    navigate("/login")
                }
                if (e.response?.status === 403) {
                    toast.error("Please enter Valid Information")
                }
                if (e.response?.status === 500) {
                    toast.error("Internal Server Error!!")
                }
            }
        }
    }


    return (
        <>
            <div className="  w-screen min-h-screen bg-canvas  ">
                <NavLinks />

                <div className="flex flex-col items-center md:grid md:grid-cols-4 md:my-[10rem] mt-5 lg:mt-24 ">
                    {/* user img */}
                    <div className="flex flex-col items-center gap-3 col-span-2 col-start-1 md:mx-auto">
                        <div className="w-32 h-32 md:w-44 md:h-44 lg:w-[14rem] lg:h-[14rem] bg-neutral-100 ring-1 ring-stone-200 rounded-full overflow-hidden flex items-center justify-center">
                            {savedAvatarURL ? (
                                <img src={savedAvatarURL} alt="userImg" className="w-full h-full object-cover" />
                            ) : (
                                <img src="/user.svg" alt="userImg" className="w-full h-full object-contain" />
                            )}
                        </div>
                        {/* avatar edit */}
                        {avatarEdit ? (
                            <div className="flex flex-col gap-2 w-[200px]">
                                <input
                                    type="url"
                                    className="w-full px-3 py-1.5 text-sm field"
                                    placeholder="https://...image.jpg"
                                    value={avatarURL}
                                    onChange={(e) => setAvatarURL(e.target.value)}
                                />
                                <ImageUploadButton onUploaded={(url) => setAvatarURL(url)} label="Upload from device" square title="Crop avatar" />
                                <div className="flex gap-2">
                                    <button
                                        className="btn-primary flex-1 h-8 text-sm font-medium"
                                        onClick={async () => {
                                            if (!avatarURL.trim()) { setAvatarEdit(false); return; }
                                            try {
                                                const res = await axios.put(`${USERS_BACKEND_URL}/updateAvatar`, { imageURL: avatarURL.trim() }, { withCredentials: true })
                                                if (res.status === 200) {
                                                    setSavedAvatarURL(avatarURL.trim());
                                                    setAvatarEdit(false);
                                                    toast.success("Avatar updated!")
                                                }
                                            } catch {
                                                toast.error("Failed to update avatar")
                                            }
                                        }}
                                    >Save</button>
                                    <button className="btn-ghost flex-1 h-8 text-sm font-medium" onClick={() => { setAvatarEdit(false); setAvatarURL(savedAvatarURL); }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <button className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors" onClick={() => { setAvatarEdit(true); setAvatarURL(savedAvatarURL); }}>Edit Avatar</button>
                        )}
                    </div>

                    {/* details */}
                    <div className="flex flex-col items-center ">
                        {/* profile stats includes follower and following and post count */}
                        <ProfileStats></ProfileStats>

                        {/* edit profile btn */}
                        <button className="btn-ghost self-center px-4 h-9 text-sm font-medium mt-6" onClick={() => setEdit(true)} >
                            Edit Profile
                        </button>

                        {/* save btn */}
                        {
                            edit &&
                            <div className="flex gap-5">
                                <button className="btn-primary px-4 h-9 text-sm font-medium mt-4" onClick={handleSave} >
                                    Save
                                </button>
                                <button className="btn-ghost px-4 h-9 text-sm font-medium mt-4" onClick={() => setEdit(false)} >
                                    Cancel
                                </button>
                            </div>
                        }

                        {/* username & email */}
                        <UserEmailProfile edit={edit} nameVal={changes.username ?? ""} emailVal={changes.email ?? ""} setOnChange={handleChange} />

                        {/* verify btn*/}
                        {
                            !verified && !box &&
                            <button className="btn-ghost px-4 h-9 text-sm font-medium self-center mt-6" onClick={onClickSendOtp} >
                                Verify Email
                            </button>
                        }

                        {/* verified */}
                        {
                            verified &&
                            <button className="flex gap-1 items-center px-4 h-9 rounded-full text-sm font-medium text-primary bg-primary/5 border border-primary/20 mt-6" disabled >
                                Verified
                                <span className="w-5 h-5"><img src="/check.svg" alt="checked" /></span>
                            </button>
                        }

                        {/* verify with otp box */}
                        {
                            !verified && box &&
                            <>
                                <div className="flex items-center gap-3 mt-5 mb-2 md:mt-6 md:mb-3 lg:mt-10 lg:gap-4">
                                    <input type="text" className="w-[9rem] h-10 field text-center text-sm lg:text-base" placeholder="Enter OTP" />
                                    <button className="btn-primary flex gap-1 px-4 h-10 rounded-full text-center text-sm font-medium" onClick={onClickVerify} >
                                        Verify OTP
                                    </button>
                                </div>
                                {/* countdown timer */}
                                <CountDown />
                            </>

                        }

                        {/* logout btn */}
                        <button className="flex items-center gap-2 px-4 h-9 rounded-full text-sm font-medium text-red-600 bg-red-50 border border-red-200 mt-8 self-center hover:bg-red-100 transition-colors" onClick={onClickLogout} >
                            Log Out
                            <span className="w-5 h-5"><img src="/logout.svg" alt="" /></span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}















// on the dashboard the user svg icon over navlinks must have a pulse animation that would target the user to folow the user profile, and ask to edit the info.
// On user profile there will be a pulse animate to fill the empty user info field including the image.
// From here a backend request would go out that will include updated user profile info
// {
//     username, 
//     imageURL,
//     user Bio  // may be I need to create a bio field for each user in database.
// }