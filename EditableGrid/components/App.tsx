import * as React from "react";
import { IInputs, IOutputs } from "../generated/ManifestTypes";
import { setIconOptions } from "office-ui-fabric-react/lib/Styling";
import { initializeIcons } from '@uifabric/icons';
import { DetailsList, TextField, IColumn, SelectionMode, IconButton } from '@fluentui/react';

initializeIcons();
setIconOptions({
    disableWarnings: true,
});

type AppProps = {
    context: ComponentFramework.Context<IInputs>;
    onChange: (outputs: IOutputs) => void;
}

const App: React.FC<AppProps> = (props) => {

    const { context, onChange } = props;
    const jsonData = JSON.parse(context.parameters.JSONdata.raw || '[]') as any[];

    let [ items, setItems ] = React.useState(jsonData);
    let columns: IColumn[] = (context.parameters.Columns.raw || '').split(',').map(columnDef => {
        let columnDefSplit = columnDef.split(':');
        let columnName = columnDefSplit[0];
        let width = columnDef.length > 0 ? +columnDefSplit[1] : undefined;
        return {
            key: columnName,
            name: columnName,
            fieldName: columnName,
            maxWidth: width,
            minWidth: width
        } as IColumn;
    });

    // Add delete row button
    columns.push({
        key: 'delete-row-btn',
        name: '',
        fieldName: '',
        maxWidth: 50,
        minWidth: 50,
        onRender: (item?: any, index?: number, column?: IColumn): any => {
            return (
                <IconButton 
                    iconProps={{ iconName: 'Delete' }}
                    onClick={() => {
                        if (index != undefined) {
                            //let data = items.slice();
                            let rowIndex = items.indexOf(item);
                            let data = items.slice(0, rowIndex).concat(items.slice(rowIndex + 1)) 
                            //data.splice(data.indexOf(item), 1);
                            setItems(data);
                            onChange({
                                JSONdata: JSON.stringify(data),
                                InnerHeight: context.parameters.InnerHeight.raw || ''
                            });
                        }
                    }}
                />
            );
        }
    } as IColumn);

    // if last line is empty - push one for new lines creation
    if (items.length === 0 || JSON.stringify(items[items.length - 1]) !== '{}') {
        let data = items.slice();
        data.push({});
        setItems(data);
    }

    // if height not specify yet - do it
    if (isNaN(parseInt(context.parameters.InnerHeight.raw || ''))) {
        onChange({
            JSONdata: JSON.stringify(jsonData),
            InnerHeight: context.parameters.InnerHeight.raw || ''
        });
    }
    
    const onValueChange = (index: number, fieldName: string, newValue: any): void => {
        let data = items.slice();
        data[index][fieldName] = newValue;
        setItems(data);
        onChange({
            JSONdata: JSON.stringify(data),
            InnerHeight: context.parameters.InnerHeight.raw || ''
        });
    }

    const renderColumn = (item?: any, index?: number, column?: IColumn): React.ReactNode => {

        if (index === undefined || !column || !column.fieldName) {
            return null;
        }

        let value = item[column.fieldName];

        if (typeof value === 'string' || typeof value === 'undefined') {
            return (
                <TextField
                    value={value || ''}
                    onChange={(event, newValue?: string) => onValueChange(index, column.fieldName as string, newValue)}
                    borderless={true}
                    tabIndex={index * 100}
                    />
            )
        }

        return value;
    }
    

    return (
        <div style={{padding: 10, textAlign: 'initial', height: '100%', overflowY: 'auto'}}>
            <DetailsList
                columns={columns}
                selectionMode={SelectionMode.none}
                compact={true}
                items={items}
                getKey={(item: any, index?: number) => index?.toString() || ''}
                onRenderItemColumn={renderColumn}
            />
        </div>
    );
}

export default App;