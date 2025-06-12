import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [ReactiveFormsModule, NgxEditorModule, NgStyle],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextEditorComponent implements OnInit, OnDestroy {
  readonly placeholder = input('Type here...');
  readonly label = input('Label');
  readonly type = input<InputTypeTextEditor>('Advance');
  readonly isRequired = input<boolean>(false);
  readonly name = input("");
  readonly height = input('250px');
  readonly control = input<any>();

  toolbar = computed(() => {
    if (this.type() === 'Advance') {
      return this.fullOptions;
    } else if(this.type() === 'Basic'){
      return [
        ['bold', 'italic'],
        ['code', 'blockquote'],
        ['ordered_list', 'bullet_list'],
        [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
        ['link'],
        ['undo', 'redo'],
      ] as Toolbar;
    } else if(this.type() === 'Minimal'){
      return [
        ['superscript','subscript'],
        ['bold', 'italic'],
        ['ordered_list', 'bullet_list'],
        [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      ] as Toolbar;
    }
    return this.fullOptions;
  })

  fullOptions: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear', 'indent', 'outdent'],
    ['superscript', 'subscript'],
    ['undo', 'redo'],
  ];

  editor!: any;
  html!: '';

  async ngOnInit() {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

}

export type InputTypeTextEditor = 'Minimal' | 'Basic' | 'Advance';


