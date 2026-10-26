import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

type Props = {
  className: string
}
export const Testimonial = ({ className }: Partial<Props>) => {
  const navigate = useNavigate()
  const [quote, setQuote] = useState({
    title: "",
    author: "",
    designation: ""
  })
  useEffect(() => {
    const quotes = [
      {
        title: "Balance suggests a perfect equilibrium. There is no such thing. That is a false expectation. There are going to be priorities and dimensions of your life, how you integrate them is how you find true happiness.",
        author: "Pete Cashmore", designation: "CEO | Mashable"
      },
      { title: "We are really competing against ourselves, we have no control over how other people perform", author: "Mark Zuckerberg", designation: "CEO | Twitter" },
    ]
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setQuote({
      title: randomQuote.title,
      author: randomQuote.author,
      designation: randomQuote.designation
    })
    return () => { }
  }, [navigate])
  return (
    <div className={`${className}  lg:flex flex-col justify-center items-center h-screen  bg-primary relative overflow-hidden `}>
      <span className="font-serif text-[12rem] leading-none text-white/10 absolute top-2 left-8 select-none">&ldquo;</span>
      <div className="m-8 lg:m-16 max-w-xl text-start relative">
        <h1 className="text-[1.05rem] md:text-[1.3rem] lg:text-[1.6rem] font-medium leading-relaxed text-white "> {quote.title} </h1>
        <p className="  font-semibold self-start mt-4 text-sm md:text-base lg:text-base text-accent"> {quote.author} </p>

        <p className=" text-xs md:text-sm text-white/60"> {quote.designation} </p>
      </div>
    </div>
  )
}
