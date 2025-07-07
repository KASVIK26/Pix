import { Pressable, StyleSheet, Text, View } from "react-native"
import {  hp, wp } from "../helpers/common"
import { theme } from "../constants/theme"
import { capitalize } from "lodash"


export const SectionView =({title, content, colors}) =>{
    return(
        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            <View>
                {content}
            </View>
        </View>
    )
}
export const CommonFilterRow = ({data, filterName, filters, setFilters, colors}) => {

    const onSelect = (item) => {
        setFilters({...filters, [filterName]: item});
    }
    return (
        <View style={styles.flexRowWrap}>
            {
                data && data.map((item, index) => {
                    let isActive = filters && filters[filterName] ==item;
                    // Better contrast for active/inactive states
                    let backgroundColor = isActive ? colors.accent : colors.background;
                    let color = isActive ? theme.colors.white : colors.text;
                    let borderColor = isActive ? colors.accent : colors.textSecondary;
                    return (
                        <Pressable 
                           onPress={() => onSelect(item)}
                           key={item} 
                           style={[styles.outlineButton, {backgroundColor, borderColor}]}
                        >
                            <Text style={[styles.outlinedButtonText, {color}]} >{capitalize(item)}</Text>
                        </Pressable>
                    )
                })
            }
        </View>
    )
}
export const ColorFilter = ({data, filterName, filters, setFilters, colors}) => {

    const onSelect = (item) => {
        setFilters({...filters, [filterName]: item});
    }
    return (
        <View style={styles.flexRowWrap}>
            {
                data && data.map((item, index) => {
                    let isActive = filters && filters[filterName] ==item;
                    // Better contrast for active state
                    let borderColor = isActive ? colors.accent : colors.textSecondary;
                    let borderWidth = isActive ? 3 : 2;
                    return (
                        <Pressable 
                           onPress={() => onSelect(item)}
                           key={item} 
                        >
                            <View style={[styles.colorWrapper, {borderColor, borderWidth}]}>
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
    marginBottom: 10,
 },
 sectionTitle:{
    fontSize: hp(2.4),
    fontWeight: 'bold',
 },
 flexRowWrap:{
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
 },
 outlineButton:{
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderCurve: 'continuous',
    borderRadius: theme.radius.xs,
    minHeight: 36, // Better touch target
    minWidth: 60, // Minimum width for better appearance
    justifyContent: 'center',
    alignItems: 'center',
 },
 outlinedButtonText:{
    fontSize: hp(1.8),
    fontWeight: '600',
    textAlign: 'center',
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