import { motion } from "motion/react"
import { ChangeEvent, Dispatch } from "react"

type Props = {
    type?: string
    className?: string
    id?: string
    placeholder?: string
    setValue: Dispatch<React.SetStateAction<string>>
}
export const InputBox = ({ type, id, placeholder, setValue }: Props) => {

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
    }
    return (
        <>
            <motion.input initial={{ opacity: 0, }} animate={{ opacity: 1, }} transition={{ duration: 0.5, ease: "easeInOut", delay : 0.5}} type={type} id={id} className={` w-[280px] h-11 px-3 text-neutral-900 field placeholder:text-neutral-400 `} placeholder={placeholder} onChange={handleOnChange}>
            </motion.input>
        </>
    )
}

