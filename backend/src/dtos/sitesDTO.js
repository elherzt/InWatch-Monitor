export function sitesDTO(site) {
    return {
        id: site.id,
        check_url: site.check_url,
        name: site.displayname
    };
}