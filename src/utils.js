const mobile = /Android|webOS|iPhone|iPad|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export function isMobile() {
    return mobile;
}
