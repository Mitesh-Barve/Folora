import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useSetRecoilState } from "recoil";
import { Counter } from "./Counter";
import { USERS_BACKEND_URL } from "../../config";
import { token } from "../../store/atoms/otpAtoms";
import { toast } from "sonner";

const CountDown = (() => {

    const [isOver, setOver] = useState<boolean>(false)
    const setOTP = useSetRecoilState(token)
    const resetTimer = async () => {
        try {
            const res = await axios.get(`${USERS_BACKEND_URL}/getOtp`)
            if (res.status === 200) {
                const { OTP } = res.data;
                setOTP(OTP)
                setOver(false)
            }
        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.response?.status === 400) {
                    toast.error("Error Sending OTP!")
                } else {
                    toast.error("Internal Server Error")
                }
            }
        }
    }

    return (
        <>
            {
                isOver === false ?
                    <Counter setValue={setOver} seconds={119} />
                    :
                    <div className=''>
                        <button className="btn-ghost rounded-full w-[8rem] h-10 p-1 text-center font-medium text-sm lg:text-base lg:mt-3 " onClick={resetTimer}>Resend OTP</button>
                    </div>
            }
        </>

    );
});

export default CountDown;