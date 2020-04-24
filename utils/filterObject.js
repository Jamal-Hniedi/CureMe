/**
 * Filter object
 * @param obj Object to filter
 * @param allowedFields If you wanna set only notAllowedFields set this param to null
 * @param notAllowedFields
 */
const filter = (obj, allowedFields, notAllowedFields) => {
    const newObj = {};
    if (allowedFields)
        Object.keys(obj).forEach(value => {
            if (allowedFields.includes(value)) newObj[value] = obj[value];
        });
    else
        Object.keys(obj).forEach(value => {
            if (!notAllowedFields.includes(value)) newObj[value] = obj[value];
        });
    return newObj;
};
module.exports = filter;