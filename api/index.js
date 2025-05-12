import axios from "axios";

const API_KEY = Your_Api_Key_from_Pixabay;

const apiURL=`https://pixabay.com/api/?key=${API_KEY}`;

const formatUrl = (params) => {
    let url = apiURL+"&per_page=25&safesearch=false&editors_choice=false";
    if(!params) return url;
    let paramKeys = Object.keys(params);
    paramKeys.map(key => {
        let value = key=='q'? encodeURIComponent(params[key]) : params[key];
        url += `&${key}=${value}`;

    });
    //console.log('final url: ',url);
    return url;
}
export const apiCall = async (params) => {
    try {
    const response = await axios.get(formatUrl(params));  
    const {data} = response;
    //console.log('data: ',data.hits[0])
    return{success:true,data}  
    
    } catch (err) {
        console.log('goterror: ', err.message)
        return{success:false,msg: err.message}
    }
}
