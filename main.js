/**
 * CONSTANTS
 */
const SSO_URL = 'https://sso.muydev.com/v1/services'
const URL_API_SMS = 'https://dev.loyalty.muydev.com/api/v2/users/validator'
const URL_API_REGISTER = 'https://feature-TCAG-281-foodcoins-ag.loyalty.muydev.com/api/v2/users/register'
const KEY_TOKEN = 'userToken'
const KEY_REGISTER = 'isRegister'
const KEY_RECOVERY = 'isRecovery'
const KEYS_PARAMS = ['name',
	'lastname',
	'phone',
	'code']
const KEY_URL_PARAMS = 'urlParams'
const KEY_FORM_DATA = 'formData'

const DATE_INPUT_OPTIONS = {
	mask: Date,
	pattern: 'Y-`m-`d',
	blocks: {
		d: {
			mask: IMask.MaskedRange,
			from: 1,
			to: 31,
			maxLength: 2,
		},
		m: {
			mask: IMask.MaskedRange,
			from: 1,
			to: 12,
			maxLength: 2,
		},
		Y: {
			mask: IMask.MaskedRange,
			from: 1900,
			to: 9999,
		}
	},
	format: function (date) {
		var day = date.getDate();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();

		if (day < 10) day = "0" + day;
		if (month < 10) month = "0" + month;

		return [year, month, day].join('-');
	},
	parse: function (str) {
		var yearMonthDay = str.split('-');
		return new Date(yearMonthDay[0], yearMonthDay[1] - 1, yearMonthDay[2]);
	},
};

const PIN_INPUT_OPTIONS = {
	mask: '0000'
}

const PIN_RECOVERY_INPUT_OPTIONS = {
	mask: '0'
}

/**
 * ELEMENT FROM DOM
 */
const formRegister = document.getElementById('register-form')
const formDateInput = document.getElementById('birthday');
const formPinInput = document.getElementById('pin-2');
const formRegisterPin = document.getElementById('register-form-pin')
const formRegisterSucess = document.getElementById('register-form-sucess')

const spanName = document.getElementById('span-name-user')

//recovery
const formRecovery = document.getElementById('form-recovery')
const formRecoveryStep2 = document.getElementById('form-recovery-stp-2')
const inputRecovery1 = document.getElementById('input-pin-1')
const inputRecovery2 = document.getElementById('input-pin-2')
const inputRecovery3 = document.getElementById('input-pin-3')
const inputRecovery4 = document.getElementById('input-pin-4')
const btnRecoveryPin = document.getElementById('btn-recovery')



async function getTokenSso() {
	axios.post(SSO_URL, {
		"issuer": "landing-foodcoins.v2",
		"auth_key": "6ad81ef9-b923-480b-849a-42e2801bb53d",
		"auth_secret": "8b3c74a85ccc6f75a528b25fbfdf90cf51d6916abb63f5131657b43914071622ee683275b6e43159aad970cec54c6d2d8350471546b10021878f3132f97bd916"
	})
		.then(function (response) {
			window.sessionStorage.setItem(KEY_TOKEN, response.data.result.access_token);
		})
		.catch(function (error) {
			throw Error(error)
		});

}

function setVarLocaleStorage() {
	window.localStorage.setItem(KEY_REGISTER, 'false')
	window.localStorage.setItem(KEY_RECOVERY, 'false')
}

function getParams() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const params = {}
	KEYS_PARAMS.forEach(key => {
		params[key] = urlParams.get(key)
	})
	if (params.name && params.lastname && params.phone && params.code) {
		window.localStorage.setItem(KEY_REGISTER, 'true')
		window.localStorage.setItem(KEY_URL_PARAMS, JSON.stringify(params))
	}
}

function handleRegisterForm() {
	if (isRegister()) {
		const params = JSON.parse(window.localStorage.getItem(KEY_URL_PARAMS))
		formRegister.classList.add('is-show')
		formRegister.querySelector('input[name="name"]').value = params.name
		formRegister.querySelector('input[name="lastname"]').value = params.lastname
		formRegister.querySelector('input[name="phone"]').value = params.phone
		formRegister.querySelector('select[name="code"]').value = params.code
	}
}

function isRegister() {
	const keyRegister = JSON.parse(window.localStorage.getItem(KEY_REGISTER))
	return keyRegister
}
function isRecovery() {
	const keyRecovery = JSON.parse(window.localStorage.getItem(KEY_RECOVERY))
	return keyRecovery
}

function handleSendSms({ name, phone, code }) {
	if (isRegister()) {
		axios.post(URL_API_SMS, {
			phoneNumber: phone,
			phoneCode: code,
			name: name,
			type: 2,
			channel: "sms"
		}, {
			headers: {
				Authorization: `Bearer ${window.sessionStorage.getItem(KEY_TOKEN)}`
			}
		}).then(() => {
			formRegister.classList.remove('is-show')
			formRegisterPin.classList.add('is-show')
		}).catch(() => {
			alert('Hubo un error al enviar el sms, por favor intenta de nuevo')
		})
	}
}

function handleSendRecovery({ phone, code }) {
	if (isRegister()) {
		axios.post(URL_API_SMS, {
			phoneNumber: phone,
			phoneCode: code,
			type: 3,
			channel: "sms"
		}, {
			headers: {
				Authorization: `Bearer ${window.sessionStorage.getItem(KEY_TOKEN)}`
			}
		}).then(() => {
			formRecovery.classList.remove('is-show')
			formRecoveryStep2.classList.add('is-show')
		}).catch(() => {
			alert('Hubo un error al enviar el sms, por favor intenta de nuevo')
		})
	}
}

function handleRegisterUser(data = JSON.parse(window.localStorage.getItem(KEY_FORM_DATA))) {
	axios.post(URL_API_REGISTER, {
		first_name: data.name,
		last_name: data.lastname,
		document: {
			id: data.typeIdent,
			value: data.document
		},
		phone_number: data.phone,
		phone_code: data.code,
		email: data.email,
		pin: data.pin,
		birthday_date: data.birthday,
		code_sms: data.codeSms,
		accept_terms: 1
	}, {
		headers: {
			Authorization: `Bearer ${window.sessionStorage.getItem(KEY_TOKEN)}`
		}
	}).then(() => {
		const codeSms = formRegisterPin.querySelector('input[name="input-code"]').value
		const data = JSON.parse(window.localStorage.getItem(KEY_FORM_DATA))
		window.localStorage.setItem(KEY_FORM_DATA, JSON.stringify({ ...data, codeSms }))
		spanName.innerHTML = `${data.name}`
		formRegisterPin.classList.remove('is-show')
		formRegisterSucess.classList.add('is-show')
	})
		.catch((error) => {
			alert(error.response.data?.message)
			formRegisterPin.classList.remove('is-show')
			formRegister.classList.add('is-show')
		})
}

function handleInputsPin() {
	const inputs = formRecoveryStep2.querySelectorAll('input[name="input-pin"]')
	
	console.log(inputs.length)
	// inputs.forEach(input, index => {
	// 	input.addEventListener('keyup', (e) => {
	// 		if (e.keyCode === 8 || e.keyCode === 46) {
	// 			input.value = ''
	// 			inputs[index - 1].focus();
	// 		}
	// 		inputs[index + 1].focus();
	// 	})
	// })

}

function clearFormData() {
	formRegister.querySelector('input[name="name"]').value = ''
	formRegister.querySelector('input[name="lastname"]').value = ''
	formRegister.querySelector('input[name="phone"]').value = ''
	formRegister.querySelector('select[name="code"]').value = ''
	formRegister.querySelector('input[name="email"]').value = ''
	formRegister.querySelector('input[name="pin"]').value = ''
	formRegister.querySelector('input[name="birthday"]').value = ''
	formRegisterPin.querySelector('input[name="input-code"]').value = ''
	spanName.innerHTML = ``
	window.localStorage.setItem(KEY_REGISTER, 'false')
	window.localStorage.removeItem(KEY_FORM_DATA)
	window.localStorage.removeItem(KEY_URL_PARAMS)

	window.location.href = '/'
}

getTokenSso()
setVarLocaleStorage()
getParams()
handleRegisterForm()

IMask(formDateInput, DATE_INPUT_OPTIONS);
IMask(formPinInput, PIN_INPUT_OPTIONS);
IMask(inputRecovery1, PIN_RECOVERY_INPUT_OPTIONS);
IMask(inputRecovery2, PIN_RECOVERY_INPUT_OPTIONS);
IMask(inputRecovery3, PIN_RECOVERY_INPUT_OPTIONS);
IMask(inputRecovery4, PIN_RECOVERY_INPUT_OPTIONS);

//watch onsubmit form register
formRegister.addEventListener('submit', async () => {
	if (isRegister()) {
		const name = formRegister.querySelector('input[name="name"]').value
		const lastname = formRegister.querySelector('input[name="lastname"]').value
		const phone = formRegister.querySelector('input[name="phone"]').value
		const code = formRegister.querySelector('select[name="code"]').value
		const typeIdent = formRegister.querySelector('select[name="typeIdent"]').value
		const document = formRegister.querySelector('input[name="document"]').value
		const email = formRegister.querySelector('input[name="email"]').value
		const birthday = formDateInput.value
		const pin = formPinInput.value

		window.localStorage.setItem(KEY_FORM_DATA, JSON.stringify({ name, lastname, phone, code, birthday, email, pin, typeIdent, document }))
		await getTokenSso()
		handleSendSms({ name, phone, code })
	}
});

//watch onsubmit form register pin
formRegisterPin.addEventListener('submit', async () => {
	await getTokenSso()
	const codeSms = formRegisterPin.querySelector('input[name="input-code"]').value
	const data = JSON.parse(window.localStorage.getItem(KEY_FORM_DATA))
	window.localStorage.setItem(KEY_FORM_DATA, JSON.stringify({ ...data, codeSms }))
	handleRegisterUser()
});

//watch onsubmit form register sucess
formRegisterSucess.addEventListener('submit', () => {
	clearFormData()
});


//watch onClick button recovery
btnRecoveryPin.addEventListener('click', () => {
	formRecovery.classList.add('is-show')
	windows.localStorage.setItem(KEY_RECOVERY, 'true')
})

//watch onsubmit form recovery
formRecovery.addEventListener('submit', async () => {
	if (isRecovery()) {
		const phone = formRecovery.querySelector('input[name="phone"]').value
		const code = formRecovery.querySelector('select[name="code"]').value

		window.localStorage.setItem(KEY_FORM_DATA, JSON.stringify({ phone, code }))
		await getTokenSso()
		handleSendRecovery({ phone, code })
	}
})

formRecoveryStep2.addEventListener('onkeypress', async () => {
	handleInputsPin()
})
