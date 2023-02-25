export function ChooseRandomElementFromList<T>(list: T[]): T{
    return list[Math.floor(Math.random() * list.length)]
}