const Var = {
    dynamic: true,
    name: ({type, value, idx}) => `var${type}_${idx}`,
    props: ({value}) => [
        {
            id: 'value',
            value: value,
            render: (value) => value
        }
    ]
};

export function makeVariables(type, name, getVars) {
    return {
        dynamic: true,
        name: () => name,
        numChildren: () => getVars().length,
        child: () => Var,
        childData: (data, idx) => {
            const vargames = getVars();
            return {
                type: type,
                value: vargames[idx],
                idx
            };
        }
    }
}
