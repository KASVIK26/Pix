import { Feather, FontAwesome, FontAwesome6, Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Categories from '../../components/categories';
import { apiCall } from '../../api';
import ImageGrid from '../../components/ImageGrid.js';
import debounce from 'lodash.debounce';
import { set } from 'lodash';
import FiltersModal from '../../components/filtersModal.js';
import { useRouter } from 'expo-router';

var page = 1;
const HomeScreen = () => {
    const {top} = useSafeAreaInsets();
    const paddingTop = top>0 ? top+10 : 30;
    const [search,setsearch] = useState('');
    const searchInputRef = useRef(null);
    const [images,setImages] = useState([]);
    const [filters, setFilters] = useState(null);
    const [activeCategory, setactiveCategory] = useState(null);
    const modalRef = useRef(null);
    const scrollRef = useRef(null);
    const [isEndReached, setisEndReached] = useState(false);
    const router = useRouter();

    useEffect(() => {
      fetchImages();
    },[]);
    const fetchImages = async(params={page: 1}, append=true) => {
      console.log(params,append);
      let res = await apiCall(params);
      if(res.success && res?.data?.hits){
        if(append)
          setImages([...images,...res.data.hits])      
        else
        setImages([...res.data.hits])
      }
    }

    const openfiltersModal = () => {
      modalRef.current?.present();

    }
    const closeFiltersModal = () => {
      modalRef.current?.close();
    }
    const applyFilters = () => {
      if(filters){
        page = 1;
        setImages([]);
        let params = {page, ...filters};
        if(activeCategory) params.category = activeCategory;
        if(search) params.q = search;
        fetchImages(params, false);

      }
      closeFiltersModal();
      
    }
    const resetFilters = () => {
      if(filters){
        page = 1;
        setFilters(null);
        setImages([]);
        let params ={
          page,
          
        }
        if(activeCategory) params.category = activeCategory;
        if(search) params.q = search;
        fetchImages(params, false);
      }
      closeFiltersModal();

      
    }

    const clearThisFilter = (filterName) => {
      let filterz = {...filters};
      delete filterz[filterName];
      setFilters({...filterz}); 
      page = 1;
      setImages([]);
      let params = {page, ...filterz};
      if(activeCategory) params.category = activeCategory;
      if(search) params.q = search;
      fetchImages(params, false);
    }
    const handleChangeCategory = (cat) => {
        setactiveCategory(cat);
        clearSearch();
        setImages([]);
        page = 1;
        let params = {page, ...filters};
        if(cat){
          params.category = cat;
        }
        fetchImages(params, false);
    }
    console.log(activeCategory);

    const handleSearch = (text) => {
      setsearch(text);
      if(text.length>2){
        page = 1;
        setImages([]);
        setactiveCategory(null);
        fetchImages({page,q: text, ...filters},false);
      }
      if(text==""){
        page = 1;
        searchInputRef?.current?.clear();
        setImages([]);
        setactiveCategory(null);
        fetchImages({page,...filters},false);
      }
    }


    const clearSearch = () => {
      setsearch("");
      searchInputRef?.current?.clear();
     
    }
    const handleTextDebounce = useCallback(debounce(handleSearch, 1000), []);

    const handleScroll = (event) => {
      const contentHeight = event.nativeEvent.contentSize.height;
      const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
      const scrollOffset = event.nativeEvent.contentOffset.y;
      const bottomPosition = contentHeight - scrollViewHeight;
      if(scrollOffset >= bottomPosition - 1){
        if(!isEndReached){
          setisEndReached(true);
          page++;
          let params = {page, ...filters};
          if(activeCategory) params.category = activeCategory;
          if(search) params.q = search;
          fetchImages(params, true);
        }

    }else if(isEndReached){
      setisEndReached(false);
    }
  }
    const handleScrollUp = () => {
      scrollRef?.current?.scrollTo({ y: 0, animated: true});
    }

console.log(filters);
  return (
    <View style={[styles.container, {paddingTop}]}>
      {/* header  */}
      <View style ={[styles.header]}>
        <Pressable onPress={handleScrollUp}>
            <Text style={styles.title}>Pixels</Text>
        </Pressable>
        <Pressable onPress={openfiltersModal}>
            <FontAwesome6 name="bars-staggered" size={22} color={theme.colors.neutral(0.7)} />
        </Pressable>
      </View>
      <ScrollView onScroll={handleScroll}
      scrollEventThrottle={5}
      ref={scrollRef}
      contentContainerStyle={{gap: 15}}
      >
      {/* search bar  */}
    <View style={styles.searchBar}>
        <View style={styles.searchIcon}>
          <Feather name="search" size={24} color={theme.colors.neutral(0.4)} />
        </View>
        <TextInput
        placeholder='Search for photos...'
        //value={search}
        ref={searchInputRef}
        onChangeText={handleTextDebounce}
        style={styles.searchInput}
        />
        {
            search &&(
                <Pressable onPress={() => handleSearch("")} style={styles.closeIcon}>
                    <Ionicons name="close" size={24} color={theme.colors.neutral(0.6)} />    
                </Pressable>
            )
        }
        
        </View>
        {/* categories  */}
        <View style={styles.categories}>
            <Categories activeCategory={activeCategory} handleChangeCategory={handleChangeCategory}/>
        </View>
        {/* filters  */}
        {
          filters && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {
                Object.keys(filters).map((key,index) => {
                  return(
                    <View key={index} style={styles.filterItem}>
                      {
                        key == 'colors' ?(
                          <View style={{height: 20, width: 30, borderRadius: 7, backgroundColor: filters[key]}} />
                        ):(
                          <Text style={styles.filterItemText}>{filters[key]}</Text>
                        )
                      }
                      
                      <Pressable style = {styles.filterCloseIcon} onPress={() => clearThisFilter(key)}>
                        <Ionicons name="close" size={14} color={theme.colors.neutral(0.9)} />
                      </Pressable> 
                    </View>
                  )
                })
              }
            </ScrollView>  
          )
        }
        {/* images masonry */}
        <View>
          {
            images.length > 0 && <ImageGrid images={images} router={router} />
          }
        </View>
        {/* Loading*/}
        <View style = {{marginBottom: 70, marginTop: images.length > 0 ? 10 : 70}}>
           <ActivityIndicator size="large" />
        </View>
      </ScrollView>
      {/* filters modal  */}
      <FiltersModal modalRef={modalRef} 
      filters={filters} 
      setFilters={setFilters} 
      onClose={closeFiltersModal}
      onApply={applyFilters}
      onReset={resetFilters}/>
     </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
  },
  header:{
    marginHorizontal: wp(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: hp(4),
    fontWeight: 'bold',
    color: theme.colors.neutral(0.9),
  },
  searchBar : {
    marginHorizontal: wp(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.grayBG,
    borderRadius: theme.radius.lg,
    backgroundColor: 'white',
    padding: 6,
    paddingLeft: 10,
    
  },
  searchIcon: {
    padding: 8,
    
  },
  closeIcon: {
    backgroundColor: theme.colors.neutral(0.1),
    padding: 8,
    borderRadius: theme.radius.sm,
   
  },
  searchInput: {
    flex: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    fontSize: hp(1.8),
  },
  
  filters: {
    gap: 10,
    marginHorizontal: wp(4),
    paddingEnd: wp(8),
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    
    paddingHorizontal: 10,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.neutral(0.05),
  },
  filterItemText: {
    fontSize: hp(1.9),
  },
  filterCloseIcon: {
    backgroundColor: theme.colors.neutral(0.1),
    padding: 4,
    borderRadius: 7,
  },

  
})
export default HomeScreen;