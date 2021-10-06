module.exports = regexTest = function (type, toTest) {
    const regexes = {
        email: /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
        phone: /^\+[1-9]{1}[0-9]{3,14}$/, // https://stackoverflow.com/a/5933940
        name: /^(((?=^[A-Ö][a-ö]*\-)(^[A-Ö][a-ö]*\-[A-Ö][a-ö]*)|(^[A-Ö][a-ö]*)))*$/, // Supports Å-Ä and two-part names like 'Maija-Liisa'
        password: /^.{6,}$/, // Minimum of 6 characters, same as with Firebase
    }

    switch (type) {
        case "email": {
            const regex = new RegExp(regexes.email)
            return regex.test(toTest)
        }

        case "phone": {
            const regex = new RegExp(regexes.phone)
            return regex.test(toTest)
        }

        case "name": {
            const regex = new RegExp(regexes.name)
            return regex.test(toTest)
        }

        case "password": {
            const regex = new RegExp(regexes.password)
            return regex.test(toTest)
        }
    }
}
