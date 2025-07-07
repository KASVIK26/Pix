import { Feather, FontAwesome, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
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
import { storageManager } from '../../helpers/storage';
import Toast from 'react-native-toast-message';
import { useThemedStyles } from '../../hooks/useThemedStyles';

var page = 1;
const HomeScreen = () => {
    const {top} = useSafeAreaInsets();
    const paddingTop = top>0 ? top+10 : 30;
    const [search,setsearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchInputRef = useRef(null);
    const [images,setImages] = useState([]);
    const [filters, setFilters] = useState(null);
    const [activeCategory, setactiveCategory] = useState(null);
    const modalRef = useRef(null);
    const scrollRef = useRef(null);
    const [isEndReached, setisEndReached] = useState(false);
    const router = useRouter();
    const { colors, isDark } = useThemedStyles();

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
    <View style={[styles.container, {paddingTop, backgroundColor: colors.background}]}>
      {/* header  */}
      <View style ={[styles.header]}>
        <Pressable onPress={handleScrollUp}>
            <Text style={[styles.title, { color: colors.text }]}>Pixels</Text>
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push('/favorites')} style={[styles.actionButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="heart" size={22} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={() => router.push('/collections')} style={[styles.actionButton, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="collections" size={22} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={() => router.push('/settings')} style={[styles.actionButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="settings" size={22} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={openfiltersModal} style={[styles.actionButton, { backgroundColor: colors.surface }]}>
            <FontAwesome6 name="bars-staggered" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>
      <ScrollView onScroll={handleScroll}
      scrollEventThrottle={5}
      ref={scrollRef}
      contentContainerStyle={{gap: 15}}
      >
      {/* search bar  */}
    <View style={[
      styles.searchBar, 
      { 
        backgroundColor: colors.surface, 
        borderColor: isSearchFocused ? (isDark ? '#888888' : colors.accent) : colors.border,
        borderWidth: isSearchFocused ? 2 : 1.5,
      }
    ]}>
        <View style={styles.searchIcon}>
          <Feather name="search" size={24} color={colors.textSecondary} />
        </View>
        <TextInput
        placeholder='Search for photos...'
        placeholderTextColor={colors.textSecondary}
        //value={search}
        ref={searchInputRef}
        onChangeText={handleTextDebounce}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        style={[styles.searchInput, { color: colors.text }]}
        />
        {
            search &&(
                <Pressable onPress={() => handleSearch("")} style={[styles.closeIcon, { backgroundColor: colors.surface }]}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />    
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
                    <View key={index} style={[styles.filterItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      {
                        key == 'colors' ?(
                          <View style={{height: 20, width: 30, borderRadius: 7, backgroundColor: filters[key]}} />
                        ):(
                          <Text style={[styles.filterItemText, { color: colors.text }]}>{filters[key]}</Text>
                        )
                      }
                      
                      <Pressable style={[styles.filterCloseIcon, { backgroundColor: colors.accent }]} onPress={() => clearThisFilter(key)}>
                        <Ionicons name="close" size={14} color={colors.background} />
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
      onReset={resetFilters}
      colors={colors}/>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.neutral(0.05),
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
    borderWidth: 1.5,
    borderRadius: theme.radius.xl,
    padding: 8,
    paddingLeft: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    padding: 8,
  },
  closeIcon: {
    padding: 8,
    borderRadius: theme.radius.sm,
  },
  searchInput: {
    flex: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: hp(1.8),
    outlineStyle: 'none', // Remove focus outline on web
    borderWidth: 0, // Remove any default border
    minHeight: 40, // Better touch target for mobile
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
    minHeight: 36, // Better touch target
  },
  filterItemText: {
    fontSize: hp(1.9),
    fontWeight: '500',
  },
  filterCloseIcon: {
    padding: 4,
    borderRadius: 7,
    minWidth: 24,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
export default HomeScreen;