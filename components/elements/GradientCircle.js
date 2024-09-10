export const GradientCircle = ({
    x = 0,
    y = 0,
    translateX = 0,
    translateY = 0,
    rgb = [0, 0, 0],
}) => {
    return (
        <div
            style={{
                top: y,
                left: x,
                transform: `translate(${translateX}, ${translateY})`,
                background: `radial-gradient(circle, rgba(${rgb.join(",")},0.2) 0%, rgba(0,0,0,0) 70%)`
            }}
            className="w-[1200px] aspect-square absolute"
        >

        </div>
    )
}