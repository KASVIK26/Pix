import { Pressable, StyleSheet, Text, View } from "react-native"
import {  hp } from "../helpers/common"
import { theme } from "../constants/theme"
import { capitalize } from "lodash"


export const SectionView =({title, content}) =>{
    return(
        <View style={styles.sectionContainer}>
            <Text style = {styles.sectionTitle}>{title}</Text>
            <View>
                {content}
            </View>
        </View>
    )
}
export const CommonFilterRow = ({data, filterName, filters, setFilters}) => {

    const onSelect = (item) => {
        setFilters({...filters, [filterName]: item});
    }
    return (
        <View style={styles.flexRowWrap}>
            {
                data && data.map((item, index) => {
                    let isActive = filters && filters[filterName] ==item;
                    let backgroundColor = isActive ? theme.colors.neutral(0.8) : theme.colors.white;
                    let color = isActive ? theme.colors.white : theme.colors.neutral(0.8);
                    return (
                        <Pressable 
                           onPress={() => onSelect(item)}
                           key={item} 
                           style={[styles.outlineButton, {backgroundColor, color}]}
                        >
                            <Text style={[styles.outlinedButtonText, {color}]} >{capitalize(item)}</Text>
                        </Pressable>
                    )
                })
            }
        </View>
    )
}
export const ColorFilter = ({data, filterName, filters, setFilters}) => {

    const onSelect = (item) => {
        setFilters({...filters, [filterName]: item});
    }
    return (
        <View style={styles.flexRowWrap}>
            {
                data && data.map((item, index) => {
                    let isActive = filters && filters[filterName] ==item;
                    let borderColor = isActive ? theme.colors.neutral(0.8) : theme.colors.white;
                    return (
                        <Pressable 
                           onPress={() => onSelect(item)}
                           key={item} 
                        >
                            <View style={[styles.colorWrapper, {borderColor}]}>
                                <View style={[styles.color, {backgroundColor: item}]}>

                                </View>
                            </View>
                        </Pressable>
                    )
                })
            }
        </View>
    )
}
const styles = StyleSheet.create({
 sectionContainer:{
    gap: 8,

 },
 sectionTitle:{
    fontSize: hp(2.4),
    fontWeight: 'bold',
    color: theme.colors.neutral(0.8),
 },
 flexRowWrap:{
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
 },
 outlineButton:{
    padding: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    borderCurve: 'continuous',
    borderColor: theme.colors.grayBG,
    borderRadius: theme.radius.xs,
    paddingHorizontal: 14,
    
 },
 outlinedButtonText:{
    fontSize: hp(1.8),
    fontWeight: 'bold',
    color: theme.colors.neutral(0.8),
 },
 colorWrapper:{
    padding: 3,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderCurve: 'continuous',
 },
 color:{
     width: 40,
     height: 30,
     borderRadius: theme.radius.sm-3,
     borderCurve: 'continuous',
 }
})