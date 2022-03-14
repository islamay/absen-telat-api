

const enumValues = (enumParameter: object) => {
    const enumKeys = Object.keys(enumParameter)

    return enumKeys.map((enumKey) => {
        return enumParameter[enumKey as keyof object]
    })
}

export default enumValues

