import  "./utils.common";
import DateLib from "$lib/date";
import i18n from "$i18n";
import Dictionary from "./dictionary";
import * as React from 'react'

i18n.dictionary(Dictionary);

export const locale = "fr";

export const toDateObj = (value,format,force)=>{
    if(!value) return undefined;
    if(DateLib.isDateObj(value)) return value;
    if(format !== false){
       value = DateLib.toObj(value,format);
    }
    return DateLib.isDateObj(value)? value : undefined;
}

export const compareTwoDates = (a,b)=>{
  if(!a && !b && a ===b) return true;
  return a && b && a.getTime && b.getTime && a.getTime() === b.getTime()
}

export function showWeekDay(
    dayIndex,
    disableWeekDays
  ){
    return !(disableWeekDays && disableWeekDays.some((di) => di === dayIndex))
  }
  
  export function dateToUnix(d) {
    return Math.round(d.getTime() / 1000)
  }
  
  export function addMonths(date, count) {
    let n = date.getDate()
    let n2 = new Date(date.getTime())
    n2.setDate(1)
    n2.setMonth(n2.getMonth() + count)
    n2.setDate(
      Math.min(
        n,
        getDaysInMonth({ year: n2.getFullYear(), month: n2.getMonth() })
      )
    )
  
    return n2
  }
  
  // https://stackoverflow.com/a/1185068/2508481
  // pass in any date as parameter anyDateInMonth based on dayjs
  export function getDaysInMonth({
    year,
    month,
  }){
    return [
      31,
      isLeapYear({ year }) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ][month]
  }
  
  export function getFirstDayOfMonth({year,month}) {
    return new Date(year, month, 1).getDay()
  }
  
  export function areDatesOnSameDay(a, b) {
    if (!b) {
      return false
    }
  
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }
  
  export function isDateBetween(
    date,
    {
      startDate,
      endDate,
    }
  ){
    if (!startDate || !endDate) {
      return false
    }
    return date <= endDate && date >= startDate
  }
  
  export function isLeapYear({ year }) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }
  
  export const daySize = 46
  export const estimatedMonthHeight = 360
  export const startAtIndex = 1200
  export const totalMonths = startAtIndex * 2
  export const beginOffset = estimatedMonthHeight * startAtIndex
  export const gridCounts = new Array(totalMonths)
  
  export function getGridCount(index) {
    const cHeight = gridCounts[index]
    if (cHeight) {
      return cHeight
    }
    const monthDate = addMonths(new Date(), getRealIndex(index))
    const h = getGridCountForDate(monthDate)
    gridCounts[index] = h
    return h
  }
  
  export function getGridCountForDate(date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = getDaysInMonth({ year, month })
    const dayOfWeek = getFirstDayOfMonth({ year, month })
    return Math.ceil((daysInMonth + dayOfWeek) / 7)
  }
  
  export function getRealIndex(index) {
    return index - startAtIndex
  }
  
  export function getInitialIndex(date) {
    if (!date) {
      return startAtIndex
    }
  
    const today = new Date()
    const months = differenceInMonths(today, date)
  
    return startAtIndex + months
  }

  export function getStartOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
  }
  export function getEndOfDay(d){
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
  }
  
  export function differenceInMonths(firstDate, secondDate) {
    let diffMonths = (secondDate.getFullYear() - firstDate.getFullYear()) * 12
    diffMonths -= firstDate.getMonth()
    diffMonths += secondDate.getMonth()
    return diffMonths
  }
  export function useInputFormat(locale) {
    return React.useMemo(() => {
      switch(locale){
        case "en":
          return "YYYY-MM-DD";
      }
      return "DD/MM/YYYY";
    }, [locale])
  }
  export function useDateInput({locale,value,inputMode,onChange}) {
    const [error, setError] = React.useState(null)
    const inputFormat = useInputFormat(locale)
    const formattedValue = DateLib.format(value,inputFormat.toLocaleLowerCase())
    const onChangeText = (date) => {
      const dayIndex = inputFormat.indexOf('DD')
      const monthIndex = inputFormat.indexOf('MM')
      const yearIndex = inputFormat.indexOf('YYYY')
  
      const day = Number(date.slice(dayIndex, dayIndex + 2))
      const year = Number(date.slice(yearIndex, yearIndex + 4))
      const month = Number(date.slice(monthIndex, monthIndex + 2))
  
      if (Number.isNaN(day) || Number.isNaN(year) || Number.isNaN(month)) {
        setError(
          i18n.lang('notAccordingToDateFormat',undefined,locale)(inputFormat)
        )
        return
      }
  
      const finalDate =
        inputMode === 'end'
          ? new Date(year, month - 1, day, 23, 59, 59)
          : new Date(year, month - 1, day)
      setError(null)
      if (inputMode === 'end') {
        onChange(finalDate)
      } else {
        onChange(finalDate)
      }
    }
    return {
      onChange,
      error,
      formattedValue,
      onChangeText,
      inputFormat,
    }
  }
  
  