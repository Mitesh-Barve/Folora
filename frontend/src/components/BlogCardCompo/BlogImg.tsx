type Prop = {
    imageURL: string
}
export const BlogImg = ({ imageURL }: Prop) => {
    return (
        <div className="col-span-2 md:col-span-1 bg-neutral-100 self-center ml-3 mt-3 w-[110px] h-[100px] md:w-[120px] lg:w-[170px] lg:h-[110px] rounded-xl overflow-hidden ring-1 ring-neutral-200 ">
            <img src={
                imageURL ?
                    imageURL :
                    "/logo.svg"
            } className="w-full h-full object-cover" alt="blogImg" />
        </div>
    )
}
