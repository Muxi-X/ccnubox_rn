const courseWidgetStorage = new LocalStorage();

@Entry(courseWidgetStorage)
@Component
struct CourseWidget {
  @LocalStorageProp('title') title: string = '本週課程';
  @LocalStorageProp('emptyMessage') emptyMessage: string = '尚未同步課表';
  @LocalStorageProp('course1') course1: string = '';
  @LocalStorageProp('course2') course2: string = '';
  @LocalStorageProp('course3') course3: string = '';

  build() {
    FormLink({ action: 'router', abilityName: 'EntryAbility' }) {
      Column({ space: 7 }) {
        Text(this.title)
          .fontSize(17)
          .fontWeight(FontWeight.Bold)
          .fontColor('#312E81')
          .width('100%')

        if (this.emptyMessage.length > 0) {
          Text(this.emptyMessage)
            .fontSize(14)
            .fontColor('#6B7280')
            .width('100%')
        }
        if (this.course1.length > 0) {
          this.CourseRow(this.course1)
        }
        if (this.course2.length > 0) {
          this.CourseRow(this.course2)
        }
        if (this.course3.length > 0) {
          this.CourseRow(this.course3)
        }
      }
      .alignItems(HorizontalAlign.Start)
      .backgroundColor('#F5F3FF')
      .borderRadius(18)
      .height('100%')
      .padding(16)
      .width('100%')
    }
  }

  @Builder
  CourseRow(content: string) {
    Text(content)
      .fontSize(13)
      .fontColor('#1F2937')
      .maxLines(1)
      .textOverflow({ overflow: TextOverflow.Ellipsis })
      .width('100%')
  }
}
