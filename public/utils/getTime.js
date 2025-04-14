export default function getTime(ts) {
    const date = new Date(ts);
    const h = date.getHours();
    const m = date.getMinutes();
    return pad(h) + ':' + pad(m);
}

function pad(value){
    return (value < 10) ? '0' + value : value;
}