declare function tonumber(value: string): number | undefined

declare namespace math {
    function random(): number
    function random(a: number): number
    function random(a: number, b: number): number
    function min(...args: number[]): number
    function max(...args: number[]): number
    function floor(value: number): number
    function abs(value: number): number
}