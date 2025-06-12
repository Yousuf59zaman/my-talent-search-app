# BdjobsAngularBoilerplate

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

## UI & CSS Library
UI -- Used Tailwind css and preline ui kit for designing the ui.

## Shared Folder
1. Classes 
    Configs.ts - This is a config helper resolver class. To extend this class in any component where that component expects configs data from route resolver. This class will provide the configs data from route resolver.
2. Components
    1. Checkbox - components for using checkbox in your components, passing formcontrol and other attributes.

    2. Confirmation Modal - Configurable confirmation alert to reuse in your app by injecting ConfirmationModalService in your component and calling the openConfirmationModal method. This will return an observable which you can subscribe to get the result of the confirmation modal. You can pass the title, message, confirmButtonText, cancelButtonText, showCancelButton, showConfirmButton, and icon as parameters to the openConfirmationModal method. The icon parameter can be 'success', 'error', 'warning', or 'info'. If no icon is passed, the default icon will be 'info'.

    3. Custom Select - select components where you can add/edit new options and select from previous options.

    4. Datepicker - datepicker components where you can select date from calendar or type date manually. You can pass the label, control, inline, and other attributes to the datepicker component. If inline is true, the datepicker will be displayed inline. If inline is false, the datepicker will be displayed in a dropdown. If no inline is passed, the default value will be false. also it supports timepicker options as an optional configuration seperateTimer.

    5. File Upload - This will allow you to upload file e.g excel, Image etc. there are validations for types, size and dimensions which you can pass as input. There are progress bar for showing the upload progress.

    6. IFrame loader - IFrame Loader component will load an ifram from the src url as input
    
    7. Input Component - A flexible, reusable input component for Angular applications with built-in validation and styling support.

        ## Features

        - Supports both text and numeric inputs
        - Built-in validation
        - Customizable styling
        - Reactive forms integration
        - Change detection optimization
        - Numeric input restrictions
        - Min/Max value validation
        - Required field support
        - Disabled state support

        ## Installation

        The component is standalone and can be imported directly into your modules or components:

        ```typescript
        import { InputComponent } from './shared/components/input/input.component';
        ```

        ## Usage

        ### Basic Usage

        ```html
        <app-input
        [control]="formControl"
        [isNumericOnly]="false"
        label="Username"
        placeholder="Enter username"
        >
        </app-input>
        ```

        ### Numeric Input

        ```html
        <app-input
        [control]="numericFormControl"
        [type]="'number'"
        [minValue]="0"
        [maxValue]="100"
        label="Age"
        placeholder="Enter age"
        >
        </app-input>
        ```

        ## Input Properties

        | Property         | Type              | Default          | Description |
        |-----------------|-------------------|------------------|-------------|
        | placeholder     | string            | ''               | Placeholder text for the input |
        | label           | string            | ''               | Label text for the input field |
        | type            | InputType         | 'text'           | Input type ('text' or 'number') |
        | isRequired      | boolean           | false            | Whether the field is required |
        | isDisabled      | boolean           | false            | Whether the field is disabled |
        | minValue        | number            | 0                | Minimum value (for numeric inputs) |
        | maxValue        | number            | 999999999999     | Maximum value (for numeric inputs) |
        | control         | FormControl<T>     | new FormControl()| Form control for the input |
        | maxLength       | number            | 150              | Maximum length of input |
        | classes         | string            | ''               | Additional CSS classes |
        | validationText  | string            | ''               | Custom validation message |

        ## Validation

        The component includes built-in validation that:
        - Validates text inputs for non-empty values
        - Validates numeric inputs against min/max values
        - Updates styling automatically based on validation state
        - Supports custom validation messages

        ## Example with All Properties

        ```typescript
        // In your component
        import { FormControl } from '@angular/forms';

        export class YourComponent {
        inputControl = new FormControl('');
        }
        ```

        ```html
        <app-input
        [control]="inputControl"
        label="Full Name"
        placeholder="Enter your full name"
        [type]="'text'"
        [isRequired]="true"
        [isDisabled]="false"
        [isNumericOnly]="false"
        classes="custom-class"
        validationText="Please enter a valid name"
        >
        </app-input>
        ```

        ## Styling

        The component automatically handles styling based on validation state:
        - Normal state: Default styling
        - Error state: Red highlighting and error messages
        - Custom classes can be added through the `classes` input

        ## Notes

        - The component uses `ChangeDetectionStrategy.OnPush` for better performance
        - It implements `AfterViewInit` for proper initialization
        - Includes numeric-only directive for number inputs
        - Automatically reinitializes Preline UI framework after view initialization

    8. # InputWithSearchComponent

        A reusable Angular component that provides an input field with search functionality.

        ## Features
        - Input field with customizable label and placeholder
        - Optional search button with custom label
        - Form control integration
        - Input validation support
        - Disabled state support
        - Maximum length restriction
        - Icon support

        ## Inputs

        | Input          | Type         | Default     | Description |
        |----------------|--------------|-------------|-------------|
        | label          | string       | ''          | Label text for the input field |
        | placeholder    | string       | ''          | Placeholder text for the input field |
        | isRequired     | boolean      | false       | Whether the input field is required |
        | isDisabled     | boolean      | false       | Whether the input field is disabled |
        | name           | string       | ''          | Name attribute for the input field |
        | control        | FormControl  | new FormControl() | Form control for the input field |
        | isIcon         | boolean      | false       | Whether to show an icon |
        | searchBtnLabel | string       | ''          | Label for the search button |
        | maxlength      | number       | 95          | Maximum length for the input value |

        ## Usage Example

        ```typescript
        import { InputWithSearchComponent } from './path-to-component';
        import { FormControl } from '@angular/forms';

        @Component({
        selector: 'app-your-component',
        template: `
            <app-input-with-search
            label="Search Users"
            placeholder="Enter username"
            [isRequired]="true"
            [control]="searchControl"
            searchBtnLabel="Search"
            [isIcon]="true"
            />
        `
        })
        export class YourComponent {
        searchControl = new FormControl('');
        }



    9. Modal Container Component
        This is a modal container component. To reuse this as a container of your all the modal in your component do below

        ```typescript
        export class YourComponent {
            private modalService = inject(ModalService); // Inject ModalService in your component
            onclickOpen() {
                this.modalService.setModalConfigs({
                    attributes:{}, // pass any attributes e.g. width, height, etc. that you want to pass your modal
                    inputs:{}, // pass the input data what you want to pass your components
                    componentRef:TestComponent  //pass the component that you want to render in  the modal
                })
            }

            //to close the model
            this.modalService.closeModal();

        }

    10. 
