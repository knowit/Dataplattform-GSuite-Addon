import React, { useState } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    Typography
} from '@material-ui/core'


interface CheckListHeadProps {
    numSelected: number
    onCheckAll: () => void
    rowCount: number
    header: string
}

const CheckListHead = ({ onCheckAll, numSelected, rowCount, header } : CheckListHeadProps) => {
    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={() => onCheckAll()}
                    />
                </TableCell>
                <TableCell>
                    <Typography variant="subtitle2">{header}</Typography>
                </TableCell>
            </TableRow>
        </TableHead>
    )
}


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
        },
        paper: {
            width: '100%',
            marginBottom: theme.spacing(2),
        }
    }),
)

interface CheckListItem {
    title: string
    id: any
}

type Item<T> = T & CheckListItem

interface CheckListProps<T> {
    items: Item<T>[]
    selected: Item<T>[]
    header?: string
    onSelectAll?: () => void
    onDeselectAll?: () => void
    onSelect?: (item: Item<T>) => void
    onDeselect?: (item: Item<T>) => void
}

export default function CheckList<T>({ 
    items,
    selected,
    header = '',
    onSelectAll = () => null,
    onDeselectAll = () => null,
    onSelect = () => null,
    onDeselect = () => null
}: CheckListProps<T>) {
    const classes = useStyles()

    const isSelected = (item: Item<T>) => selected.filter(x => item.id === x.id).length === 1

    const handleSelect = (item: Item<T>) => {
        if (!isSelected(item)) {
            onSelect(item)
        } else {
            onDeselect(item)
        } 
    }
    const handleSelectAll = () => {
        if (!(selected.length === items.length)) {
            onSelectAll()
        } else {
            onDeselectAll()
        } 
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper} elevation={0}>
                <TableContainer>
                    <Table size='small'>
                        <CheckListHead
                            numSelected={selected.length}
                            onCheckAll={handleSelectAll}
                            rowCount={items.length}
                            header={header}
                        />
                        <TableBody>
                            {items.map(item => {
                                const isItemSelected = isSelected(item)

                                return (
                                    <TableRow
                                        hover
                                        onClick={() => handleSelect(item)}
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={item.title}
                                        selected={isItemSelected}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isItemSelected}
                                            />
                                        </TableCell>
                                        <TableCell component="th" scope="row" padding="none">
                                            {item.title}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    )
}
