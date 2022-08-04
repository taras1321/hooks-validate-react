import { useEffect, useState } from 'react'

const useValidation = (value, validations) => {
    const [errors, setErrors] = useState([])
    const [inputValid, setInputValid] = useState(true)

    const setError = (name, text) => {
        setErrors((prevErrors) => {
            if (prevErrors.find((error) => error.name === name)) {
                return prevErrors
            }

            return [...prevErrors, { name, text }]
        })
    }

    const removeError = (name) => {
        setErrors((prevErrors) => {
            if (!prevErrors.find((error) => error.name === name)) {
                return prevErrors
            }

            return [...prevErrors.filter((error) => error.name !== name)]
        })
    }

    useEffect(() => {
        for (const validation in validations) {
            switch (validation) {
                case 'minLength':
                    const minLength = validations[validation]
                    value.length < minLength
                        ? setError(validation, `min length is ${minLength}`)
                        : removeError(validation)
                    break
                case 'isEmpty':
                    value ? removeError(validation) : setError(validation, 'field cannot be empty')
                    break
                case 'maxLength':
                    const maxLength = validations[validation]
                    value.length > maxLength
                        ? setError(validation, `max length is ${maxLength}`)
                        : removeError(validation)
                    break
                case 'isEmail':
                    value.match(
                        /^(([^<>()[\]\\.,;:\s@\\"]+(\.[^<>()[\]\\.,;:\s@\\"]+)*)|(\\".+\\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    )
                        ? removeError(validation)
                        : setError(validation, 'enter a valid email')
                    break
                default:
                    break
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    useEffect(() => {
        if (errors.length) {
            setInputValid(false)
        } else {
            setInputValid(true)
        }
    }, [errors])

    const capitalizeFirstError = (errors) => {
        const error = errors[0]

        if (error) {
            error.text = error.text.slice(0, 1).toUpperCase() + error.text.slice(1)
        }

        return errors
    }

    return {
        errors: capitalizeFirstError(errors),
        inputValid,
        setError,
        removeError,
    }
}

const useInput = (initialValue, validations) => {
    const [value, setValue] = useState(initialValue)
    const [touched, setTouched] = useState(false)

    const valid = useValidation(value, validations)

    const onChange = (event) => {
        setValue(event.target.value)
    }

    const onChangeAndDeleteErrors = (event, errors) => {
        onChange(event)
        errors.forEach((error) => valid.removeError(error))
    }

    const onBlur = () => {
        setTouched(true)
    }

    return {
        value,
        touched,
        onChange,
        onBlur,
        onChangeAndDeleteErrors,
        ...valid,
    }
}

function App() {
    const email = useInput('', { isEmpty: true, minLength: 3, isEmail: true })
    const password = useInput('', { isEmpty: true, minLength: 5, maxLength: 8 })
    const [showAllErrors, setShowAllErrors] = useState(false)

    const submitHandler = (e) => {
        e.preventDefault()
        setShowAllErrors(true)
    }

    const clickHandler = (e) => {
        e.preventDefault()
        email.setError('test', 'hahahah')
    }

    return (
        <div className='app'>
            <form>
                <h1>Registration</h1>

                <div className='errors'>
                    {email.errors.map(
                        (error, i) =>
                            (email.touched || showAllErrors) && (
                                <span style={{ color: 'red' }} key={error.name}>
                                    {error.text}
                                    {i !== email.errors.length - 1 && ', '}
                                </span>
                            )
                    )}
                </div>

                <input
                    value={email.value}
                    onChange={(e) => email.onChangeAndDeleteErrors(e, ['test'])}
                    onBlur={email.onBlur}
                    name='email'
                    type='text'
                    placeholder='Enter your email...'
                    style={{ border: !email.inputValid && email.touched ? '1px solid red' : '' }}
                />

                {password.errors.map(
                    (error) =>
                        (password.touched || showAllErrors) && (
                            <span style={{ color: 'red' }} key={error.name}>
                                {error.text}
                            </span>
                        )
                )}

                <input
                    value={password.value}
                    onChange={password.onChange}
                    onBlur={password.onBlur}
                    name='password'
                    type='password'
                    placeholder='Enter your password...'
                    style={{ border: !password.inputValid && password.touched ? '1px solid red' : '' }}
                />

                <button
                    type='submit'
                    onClick={(e) => submitHandler(e)}
                    // disabled={!email.inputValid || !password.inputValid}
                >
                    Registration
                </button>

                <button onClick={clickHandler}>test</button>
            </form>
        </div>
    )
}

export default App
