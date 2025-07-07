import axios from "axios";

const API_KEY = "46143805-cf6d388122431f51de5e91d3c";

const apiURL=`https://pixabay.com/api/?key=${API_KEY}`;

const formatUrl = (params) => {
    let url = apiURL+"&per_page=25&safesearch=false&editors_choice=true&image_type=photo&min_width=1920&min_height=1080";
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

export const searchWithFilters = async (query = '', page = 1, filters = {}) => {
    try {
        const defaultFilters = {
            per_page: 25,
            safesearch: 'true',
            image_type: 'photo',
            min_width: 1920,
            min_height: 1080,
            page: page,
            q: encodeURIComponent(query),
            ...filters
        };

        const response = await axios.get(apiURL, { params: defaultFilters });
        const { data } = response;
        
        return {
            success: true,
            data: {
                hits: data.hits || [],
                total: data.total || 0,
                totalHits: data.totalHits || 0
            }
        };
    } catch (err) {
        console.log('Error in searchWithFilters:', err.message);
        return { success: false, msg: err.message };
    }
}

export const getRecommendations = async (currentImage, count = 20) => {
    try {
        const tags = currentImage.tags.split(', ').slice(0, 3);
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        
        return await searchWithFilters(randomTag, 1, {
            per_page: count,
            order: 'popular',
            safesearch: 'true'
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return { success: false, data: { hits: [], total: 0, totalHits: 0 } };
    }
}

export const getTrendingImages = async (count = 20) => {
    try {
        return await searchWithFilters('', 1, {
            per_page: count,
            order: 'popular',
            editors_choice: 'true'
        });
    } catch (error) {
        console.error('Error getting trending images:', error);
        return { success: false, data: { hits: [], total: 0, totalHits: 0 } };
    }
}