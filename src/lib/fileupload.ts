import axios from 'axios'

const KEY = import.meta.env.VITE_Pinata_API_Key
const SECRET = import.meta.env.VITE_Pinata_API_Secret
const URL = import.meta.env.VITE_Pinata_URL
const ImageGateway = import.meta.env.VITE_Pinata_IMAGE_GATEWAY
export async function handleUpload(file: File) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axios.post(URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        pinata_api_key: KEY,
        pinata_secret_api_key: SECRET
      }
    })
    const fileURL = `${ImageGateway}/${response.data.IpfsHash}`
    return fileURL
  } catch (error) {
    console.error(error)
    throw Error('Error occured in file upload')
  }
}
